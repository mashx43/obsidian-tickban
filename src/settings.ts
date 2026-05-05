import { App, PluginSettingTab, Setting } from "obsidian";
import type TickBanPlugin from "./main";

export interface TickBanSettings {
	defaultIncludeGlob: string;
	defaultExcludeGlob: string;
	showFilePath: boolean;
}

export const DEFAULT_SETTINGS: TickBanSettings = {
	defaultIncludeGlob: "**/*.md",
	defaultExcludeGlob: "",
	showFilePath: true,
};

export class TickBanSettingTab extends PluginSettingTab {
	plugin: TickBanPlugin;

	constructor(app: App, plugin: TickBanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Default include glob")
			.setDesc("Default glob pattern to include files for task extraction.")
			.addText((text) =>
				text
					.setPlaceholder("**/*.md")
					.setValue(this.plugin.settings.defaultIncludeGlob)
					.onChange(async (value) => {
						this.plugin.settings.defaultIncludeGlob = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Default exclude glob")
			.setDesc("Default glob pattern to exclude files.")
			.addText((text) =>
				text
					.setPlaceholder("Templates/**")
					.setValue(this.plugin.settings.defaultExcludeGlob)
					.onChange(async (value) => {
						this.plugin.settings.defaultExcludeGlob = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Show file path")
			.setDesc("Show file path on task cards.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showFilePath)
					.onChange(async (value) => {
						this.plugin.settings.showFilePath = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
