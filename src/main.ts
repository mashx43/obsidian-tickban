import { Plugin, type WorkspaceLeaf } from "obsidian";
import {
	DEFAULT_SETTINGS,
	type TickbanSettings,
	TickbanSettingTab,
} from "./settings";
import { TICKBAN_VIEW_TYPE, TickbanView } from "./view/KanbanView";

export default class TickbanPlugin extends Plugin {
	settings: TickbanSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon("kanban", "Open tickban", async () => {
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
		this.addSettingTab(new TickbanSettingTab(this.app, this));

		this.registerView(TICKBAN_VIEW_TYPE, (leaf) => new TickbanView(leaf, this));
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
			(await this.loadData()) as Partial<TickbanSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);

		const leaves = this.app.workspace.getLeavesOfType(TICKBAN_VIEW_TYPE);
		for (const leaf of leaves) {
			if (leaf.view instanceof TickbanView) {
				leaf.view.refresh();
			}
		}
	}
}
