import { App, PluginSettingTab, Setting } from "obsidian";
import type TickbanPlugin from "./main";

export interface TickbanSettings {
	includeGlob: string;
	excludeGlob: string;
	showFilePath: boolean;
	hideDoneAfterDays: number;
}

export const DEFAULT_SETTINGS: TickbanSettings = {
	includeGlob: "**/*.md",
	excludeGlob: "",
	showFilePath: true,
	hideDoneAfterDays: 7,
};

export class TickbanSettingTab extends PluginSettingTab {
	plugin: TickbanPlugin;

	constructor(app: App, plugin: TickbanPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Include glob")
			.setDesc(
				"Glob pattern to include files for task extraction. Support multiple patterns (one per line).",
			)
			.addTextArea((text) => {
				text
					.setPlaceholder("**/*.md")
					.setValue(this.plugin.settings.includeGlob)
					.onChange(async (value) => {
						this.plugin.settings.includeGlob = value;
						await this.plugin.saveSettings();
					});

				text.inputEl.setCssStyles({ minWidth: "80px", fieldSizing: "content" });
			});

		new Setting(containerEl)
			.setName("Exclude glob")
			.setDesc(
				"Glob pattern to exclude files. Support multiple patterns (one per line).",
			)
			.addTextArea((text) => {
				text
					.setPlaceholder("Templates/**")
					.setValue(this.plugin.settings.excludeGlob)
					.onChange(async (value) => {
						this.plugin.settings.excludeGlob = value;
						await this.plugin.saveSettings();
					});

				text.inputEl.setCssStyles({ minWidth: "80px", fieldSizing: "content" });
			});

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

		new Setting(containerEl)
			.setName("Hide done tasks (days)")
			.setDesc(
				"Hide done tasks if the file hasn't been modified for this many days. Set to 0 to show all.",
			)
			.addText((text) =>
				text
					.setPlaceholder("7")
					.setValue(this.plugin.settings.hideDoneAfterDays.toString())
					.onChange(async (value) => {
						const numValue = Number.parseInt(value, 10);
						if (!Number.isNaN(numValue) && numValue >= 0) {
							this.plugin.settings.hideDoneAfterDays = numValue;
							await this.plugin.saveSettings();
						}
					}),
			);
	}
}
