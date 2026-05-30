import { ItemView, type TFile, type WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";
import { KanbanBoard } from "../components/KanbanBoard";
import { KanbanProvider } from "../components/KanbanContext";
import { REFRESH_EVENT } from "../constants";
import type TickbanPlugin from "../main";

export const TICKBAN_VIEW_TYPE = "tickban-view";

export class TickbanView extends ItemView {
	plugin: TickbanPlugin;
	disposeSolid?: () => void;
	file: TFile | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: TickbanPlugin) {
		super(leaf);
		this.plugin = plugin;
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

		const { contentEl, app } = this;
		const { settings } = this.plugin;
		const props = {
			app,
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
