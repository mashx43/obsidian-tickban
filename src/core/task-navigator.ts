import { type App, TFile } from "obsidian";
import type { TickbanTask } from "./task-extractor";

export function revealTaskInFile(app: App, task: TickbanTask): void {
	const file = app.vault.getAbstractFileByPath(task.filePath);
	if (file instanceof TFile) {
		void app.workspace.getLeaf().openFile(file, {
			eState: { line: task.line },
		});
	}
}
