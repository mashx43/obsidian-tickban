import { App, TFile } from "obsidian";
import { TickbanTask } from "./task-extractor";

export type TaskNavigator = (task: TickbanTask) => void;

export function createTaskNavigator(app: App): TaskNavigator {
	return (task: TickbanTask): void => {
		const file = app.vault.getAbstractFileByPath(task.filePath);
		if (file instanceof TFile) {
			void app.workspace.getLeaf().openFile(file, {
				eState: { line: task.line },
			});
		}
	};
}
