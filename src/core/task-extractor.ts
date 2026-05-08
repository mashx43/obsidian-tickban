import type { App } from "obsidian";
import pm from "picomatch";

export interface TickbanTask {
	id: string; // `${file.path}:${line}`
	filePath: string;
	line: number;
	text: string;
	status: "todo" | "doing" | "done";
	tags: string[];
	mtime: number;
}

export type TaskExtractor = (
	includeGlob: string,
	excludeGlob: string,
	hideDoneAfterDays: number,
) => Promise<TickbanTask[]>;

export function createTaskExtractor(app: App): TaskExtractor {
	return async (
		includeGlob: string,
		excludeGlob: string,
		hideDoneAfterDays: number,
	): Promise<TickbanTask[]> => {
		const files = app.vault.getMarkdownFiles();
		const isIncluded = includeGlob ? pm(includeGlob) : () => true;
		const isExcluded = excludeGlob ? pm(excludeGlob) : () => false;

		const tasks: TickbanTask[] = [];
		const now = Date.now();
		const thresholdMs = hideDoneAfterDays * 24 * 60 * 60 * 1000;

		for (const file of files) {
			if (!isIncluded(file.path)) continue;
			if (isExcluded(file.path)) continue;

			const cache = app.metadataCache.getFileCache(file);
			if (!cache || !cache.listItems) continue;

			const taskItems = cache.listItems.filter(
				(item) => item.task !== undefined,
			);
			if (taskItems.length === 0) continue;

			const content = await app.vault.cachedRead(file);
			const lines = content.split("\n");

			for (const item of taskItems) {
				const lineNum = item.position.start.line;
				const lineText = lines[lineNum];
				if (!lineText) continue;

				let status: TickbanTask["status"];
				if (item.task === " " || item.task === "") {
					status = "todo";
				} else if (item.task === "/") {
					status = "doing";
				} else if (item.task?.toLowerCase() === "x") {
					if (thresholdMs && now - file.stat.mtime > thresholdMs) {
						continue;
					}

					status = "done";
				} else {
					continue; // Ignore other statuses like '-', '>', etc.
				}

				// Extract text after the checkbox
				const match = lineText.match(/-\s*\[.*?\]\s*(.*)/);
				let text = match && match[1] ? match[1].trim() : lineText.trim();

				// Extract tags (#tag) and remove them from text for cleaner display
				const tags: string[] = [];
				const tagMatches = text.match(
					/(?:^|\s)#([\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF/-]+)/g,
				);
				for (const tag of tagMatches ?? []) {
					tags.push(tag.trim());
					text = text.replace(tag, "").trim();
				}

				tasks.push({
					id: `${file.path}:${lineNum}`,
					filePath: file.path,
					line: lineNum,
					text,
					status,
					tags,
					mtime: file.stat.mtime,
				});
			}
		}

		return tasks.sort((a, b) => {
			if (a.mtime !== b.mtime) {
				return b.mtime - a.mtime;
			}
			return a.line - b.line;
		});
	};
}
