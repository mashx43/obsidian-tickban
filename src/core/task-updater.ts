import type { App } from "obsidian";
import type { TickbanTask } from "./task-extractor";

export type TaskUpdater = (
	task: TickbanTask,
	newStatus: TickbanTask["status"],
) => Promise<void>;

export function createTaskUpdater(app: App): TaskUpdater {
	return async (
		task: TickbanTask,
		newStatus: TickbanTask["status"],
	): Promise<void> => {
		const file = app.vault.getFileByPath(task.filePath);
		if (!file) return;

		let statusChar = " ";
		if (newStatus === "doing") statusChar = "/";
		if (newStatus === "done") statusChar = "x";

		await app.vault.process(file, (content) => {
			const lines = content.split("\n");
			const lineText = lines[task.line];

			if (lineText) {
				// Replace the first occurrence of `- [ ]`, `- [/]`, or `- [x]`
				lines[task.line] = lineText.replace(/-\s*\[.*?\]/, `- [${statusChar}]`);
			}

			return lines.join("\n");
		});
	};
}
