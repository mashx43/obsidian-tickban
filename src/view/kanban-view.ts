import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";
import { createTaskExtractor } from "../core/task-extractor";
import { createTaskUpdater } from "../core/task-updater";
import type TickBanPlugin from "../main";
import { KanbanBoard } from "../ui/KanbanBoard";

export const KANBAN_VIEW_TYPE = "tickban-kanban-view";

interface TickBanFrontmatter {
	includeGlob: string;
	excludeGlob: string;
}

export class KanbanView extends ItemView {
	plugin: TickBanPlugin;
	disposeSolid?: () => void;
	file: TFile | null = null;
	includeGlob: string;
	excludeGlob: string;

	constructor(leaf: WorkspaceLeaf, plugin: TickBanPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.includeGlob = this.plugin.settings.defaultIncludeGlob;
		this.excludeGlob = this.plugin.settings.defaultExcludeGlob;
	}

	getViewType() {
		return KANBAN_VIEW_TYPE;
	}

	getDisplayText() {
		return "Tickban kanban";
	}

	async setFile(file: TFile) {
		this.file = file;
		await this.loadFrontmatter();
		this.renderSolid();
	}

	async loadFrontmatter() {
		if (!this.file) return;
		const cache = this.app.metadataCache.getFileCache(this.file);
		const frontmatter: Partial<TickBanFrontmatter> | undefined =
			cache?.frontmatter;

		this.includeGlob =
			frontmatter?.includeGlob ?? this.plugin.settings.defaultIncludeGlob;
		this.excludeGlob =
			frontmatter?.excludeGlob ?? this.plugin.settings.defaultExcludeGlob;
	}

	async onOpen() {
		this.renderSolid();
	}

	renderSolid() {
		if (this.disposeSolid) {
			this.disposeSolid();
		}

		const container = this.containerEl.children[1];
		if (!container) return;
		container.empty();

		const mountEl = container.createDiv();
		mountEl.addClass("tickban-container");

		const extractor = createTaskExtractor(this.app);
		const updater = createTaskUpdater(this.app);

		this.disposeSolid = render(
			() =>
				KanbanBoard({
					loader: () => extractor(this.includeGlob, this.excludeGlob),
					updater,
				}),
			mountEl,
		);
	}

	async onClose() {
		if (this.disposeSolid) {
			this.disposeSolid();
		}
	}
}
