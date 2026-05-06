import { Plugin, WorkspaceLeaf } from "obsidian";
import {
	DEFAULT_SETTINGS,
	TickBanSettings,
	TickBanSettingTab,
} from "./settings";
import { TICKBAN_VIEW_TYPE, TickBanView } from "./view/KanbanView";

export default class TickBanPlugin extends Plugin {
	settings: TickBanSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon("columns-3", "Open tickban", async () => {
			await this.activateView();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-kanban",
			name: "Open kanban",
			callback: async () => {
				await this.activateView();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TickBanSettingTab(this.app, this));

		this.registerView(TICKBAN_VIEW_TYPE, (leaf) => new TickBanView(leaf, this));
	}

	onunload() {}

	async activateView(): Promise<WorkspaceLeaf | null> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TICKBAN_VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0] || null;
		} else {
			leaf = workspace.getLeaf(true);
			if (leaf) {
				await leaf.setViewState({ type: TICKBAN_VIEW_TYPE, active: true });
			}
		}

		if (leaf) {
			await workspace.revealLeaf(leaf);
		}

		return leaf;
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TickBanSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
