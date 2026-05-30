import type { App } from "obsidian";
import type { TickbanTask } from "./task-extractor";

export async function updateTaskInVault(
	app: App,
	task: TickbanTask,
	newStatus: TickbanTask["status"],
): Promise<void> {
	const file = app.vault.getFileByPath(task.filePath);
	if (!file) return;

	await app.vault.process(file, (content) => {
		const lines = content.split("\n");
		const lineText = lines[task.line];

		if (lineText) {
			// Replace the first occurrence of `- [ ]`, `* [ ]`, or `+ [ ]` etc.
			// while preserving the indentation and the marker (+, *, or -).
			lines[task.line] = lineText.replace(
				/^(\s*[-*+]\s*\[).*?(\])/,
				`$1${newStatus}$2`,
			);
		}

		return lines.join("\n");
	});
}
