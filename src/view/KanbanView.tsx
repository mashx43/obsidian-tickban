import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";
import {
	createTaskExtractor,
	type TaskExtractor,
} from "../core/task-extractor";
import {
	createTaskNavigator,
	type TaskNavigator,
} from "../core/task-navigator";
import { createTaskUpdater, type TaskUpdater } from "../core/task-updater";
import type TickBanPlugin from "../main";
import { KanbanBoard } from "../ui/KanbanBoard";
import { KanbanProvider } from "../ui/KanbanContext";

export const TICKBAN_VIEW_TYPE = "tickban-view";

export class TickBanView extends ItemView {
	plugin: TickBanPlugin;
	disposeSolid?: () => void;
	file: TFile | null = null;
	private extractor: TaskExtractor;
	private updater: TaskUpdater;
	private navigator: TaskNavigator;

	constructor(leaf: WorkspaceLeaf, plugin: TickBanPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.extractor = createTaskExtractor(this.app);
		this.updater = createTaskUpdater(this.app);
		this.navigator = createTaskNavigator(this.app);
	}

	getViewType() {
		return TICKBAN_VIEW_TYPE;
	}

	getDisplayText() {
		return "Tickban";
	}

	getIcon() {
		return "columns-3";
	}

	async onOpen() {
		this.renderSolid();
	}

	renderSolid() {
		this.disposeSolid?.();

		const { contentEl, extractor, updater, navigator } = this;
		const { settings } = this.plugin;
		const props = { extractor, updater, navigator, settings };

		this.disposeSolid = render(
			() => (
				<KanbanProvider {...props}>
					<KanbanBoard />
				</KanbanProvider>
			),
			contentEl,
		);
	}

	async onClose() {
		this.disposeSolid?.();
	}
}
