import { App, TFile } from "obsidian";
import { TickBanTask } from "./task-extractor";

export type TaskNavigator = (task: TickBanTask) => void;

export function createTaskNavigator(app: App): TaskNavigator {
	return (task: TickBanTask): void => {
		const file = app.vault.getAbstractFileByPath(task.filePath);
		if (file instanceof TFile) {
			void app.workspace.getLeaf().openFile(file, {
				eState: { line: task.line },
			});
		}
	};
}
