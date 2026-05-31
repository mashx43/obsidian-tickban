import { AbstractInputSuggest, type App, prepareFuzzySearch } from "obsidian";
import type { FilterItem } from "./TaskFilter";

declare module "obsidian" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface AbstractInputSuggest<T> {
		suggestEl: HTMLElement;
	}
}

interface SuggestItem extends FilterItem {
	score: number;
}

export class FilterSuggest extends AbstractInputSuggest<FilterItem> {
	private selectCallback: (item: FilterItem) => void;
	private getItems: () => FilterItem[];

	constructor(
		app: App,
		inputEl: HTMLInputElement,
		getItems: () => FilterItem[],
		onSelect: (item: FilterItem) => void,
	) {
		super(app, inputEl);
		this.getItems = getItems;
		this.selectCallback = onSelect;
		this.suggestEl.addClass("tb-suggestion-container");
	}

	getSuggestions(query: string): FilterItem[] {
		const items = this.getItems();
		if (!query) return items;

		const search = prepareFuzzySearch(query);
		const scoredItems: SuggestItem[] = [];

		for (const item of items) {
			const result = search(item.value);
			if (result && result.score > -Infinity) {
				scoredItems.push({ ...item, score: result.score });
			}
		}

		return scoredItems.sort((a, b) => b.score - a.score);
	}

	renderSuggestion(item: FilterItem, el: HTMLElement): void {
		el.createSpan({ text: item.value });
	}

	selectSuggestion(item: FilterItem, evt: MouseEvent | KeyboardEvent): void {
		this.selectCallback(item);
		this.close();
	}
}
