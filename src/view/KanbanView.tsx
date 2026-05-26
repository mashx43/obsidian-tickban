import { ItemView, type TFile, type WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";
import { KanbanBoard } from "../components/KanbanBoard";
import { KanbanProvider } from "../components/KanbanContext";
import { REFRESH_EVENT } from "../constants";
import {
	createTaskExtractor,
	type TaskExtractor,
} from "../core/task-extractor";
import {
	createTaskNavigator,
	type TaskNavigator,
} from "../core/task-navigator";
import { createTaskUpdater, type TaskUpdater } from "../core/task-updater";
import type TickbanPlugin from "../main";

export const TICKBAN_VIEW_TYPE = "tickban-view";

export class TickbanView extends ItemView {
	plugin: TickbanPlugin;
	disposeSolid?: () => void;
	file: TFile | null = null;
	private extractor: TaskExtractor;
	private updater: TaskUpdater;
	private navigator: TaskNavigator;

	constructor(leaf: WorkspaceLeaf, plugin: TickbanPlugin) {
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
		return "kanban";
	}

	async onOpen() {
		this.renderSolid();

		const refresh = () => {
			this.contentEl.dispatchEvent(new CustomEvent(REFRESH_EVENT));
		};

		this.registerEvent(this.app.vault.on("modify", refresh));
		this.registerEvent(this.app.vault.on("delete", refresh));
		this.registerEvent(this.app.vault.on("rename", refresh));
	}

	refresh() {
		this.renderSolid();
	}

	renderSolid() {
		this.disposeSolid?.();

		const { contentEl, extractor, updater, navigator, app } = this;
		const { settings } = this.plugin;
		const props = {
			app,
			extractor,
			updater,
			navigator,
			settings,
			contentEl,
		};

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
