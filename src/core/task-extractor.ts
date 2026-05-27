import type { App } from "obsidian";
import pm from "picomatch";
import { parseStatus, type TaskStatus } from "./task-status";

export interface TickbanTask {
	id: string; // `${file.path}:${line}`
	filePath: string;
	line: number;
	text: string;
	status: TaskStatus;
	tags: string[];
	mtime: number;
	parentTaskId?: string;
}

export type TaskExtractor = (
	includeGlob: string,
	excludeGlob: string,
	hideDoneAfterDays: number,
) => Promise<TickbanTask[]>;

export function createTaskExtractor(app: App): TaskExtractor {
	let lastIncludeGlob: string | undefined;
	let lastExcludeGlob: string | undefined;
	let isIncluded: (path: string) => boolean;
	let isExcluded: (path: string) => boolean;

	function compileGlob(glob: string, defaultFn: () => boolean) {
		const patterns: string[] = [];
		for (const s of glob.split("\n")) {
			const trimmed = s.trim();
			if (trimmed) patterns.push(trimmed);
		}
		return patterns.length ? pm(patterns) : defaultFn;
	}

	return async (
		includeGlob: string,
		excludeGlob: string,
		hideDoneAfterDays: number,
	): Promise<TickbanTask[]> => {
		const files = app.vault.getMarkdownFiles();

		if (includeGlob !== lastIncludeGlob) {
			isIncluded = compileGlob(includeGlob, () => true);
			lastIncludeGlob = includeGlob;
		}

		if (excludeGlob !== lastExcludeGlob) {
			isExcluded = compileGlob(excludeGlob, () => false);
			lastExcludeGlob = excludeGlob;
		}

		const tasks: TickbanTask[] = [];
		const now = Date.now();
		const thresholdMs = hideDoneAfterDays * 24 * 60 * 60 * 1000;

		for (const file of files) {
			if (!isIncluded(file.path)) continue;
			if (isExcluded(file.path)) continue;

			const cache = app.metadataCache.getFileCache(file);
			if (!cache || !cache.listItems) continue;

			const content = await app.vault.cachedRead(file);
			const lines = content.split("\n");

			const taskMap = new Map<number, TickbanTask>();
			const fileTasks: TickbanTask[] = [];

			for (const item of cache.listItems) {
				if (item.task === undefined) continue;

				const lineNum = item.position.start.line;
				const lineText = lines[lineNum];
				if (!lineText) continue;

				const status = parseStatus(item.task);
				if (
					!status ||
					(status === "x" && thresholdMs && now - file.stat.mtime > thresholdMs)
				) {
					continue;
				}

				const match = lineText.match(/^[\s]*[-*+]\s*\[.\]\s*(.*)/);
				let text = match?.[1]?.trim() || "Untitled Task";

				const tags: string[] = [];
				const tagMatches = text.match(
					/(?:^|\s)#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF/-]+)/g,
				);
				for (const tag of tagMatches ?? []) {
					tags.push(tag.trim());
					text = text.replace(tag, "").trim();
				}

				const task: TickbanTask = {
					id: `${file.path}:${lineNum}`,
					filePath: file.path,
					line: lineNum,
					text,
					status,
					tags,
					mtime: file.stat.mtime,
				};
				taskMap.set(lineNum, task);
				fileTasks.push(task);
			}

			// Assign parentTaskId
			for (const item of cache.listItems) {
				const task = taskMap.get(item.position.start.line);
				if (!task) continue;

				const isRoot = item.parent < 0;
				if (isRoot) continue;

				const parentTask = taskMap.get(item.parent);
				if (parentTask && parentTask.id !== task.id) {
					task.parentTaskId = parentTask.id;
				}
			}

			tasks.push(...fileTasks);
		}

		return tasks.sort((a, b) => {
			if (a.mtime !== b.mtime) {
				return b.mtime - a.mtime;
			}
			return a.line - b.line;
		});
	};
}
