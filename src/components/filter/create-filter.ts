import { type Accessor, batch, createMemo, createSignal } from "solid-js";
import type { KanbanContextValue } from "@/context/KanbanContext";
import type { FilterItem } from "./TaskFilter";

export function createFilter(context: KanbanContextValue) {
	const [inputValue, setInputValue] = createSignal("");
	const allItems = createAllItems(context);

	function clearAllTags() {
		const { activeTags, setTagStore } = context;

		batch(() => {
			setInputValue("");
			for (const tag of activeTags()) {
				setTagStore(tag, false);
			}
		});
	}

	return {
		inputValue,
		setInputValue,
		allItems,
		clearAllTags,
	};
}

function createAllItems(context: KanbanContextValue): Accessor<FilterItem[]> {
	const { filteredTasks, tagStore, filterPath } = context;

	return createMemo<FilterItem[]>(() => {
		const tasks = filteredTasks();
		const tagSet = new Set<string>();
		const pathSet = new Set<string>();

		for (const task of tasks) {
			pathSet.add(task.filePath);

			for (const tag of task.tags) {
				if (!tagStore[tag]) {
					tagSet.add(tag);
				}
			}
		}

		const items: FilterItem[] = [];

		const sortedTags = Array.from(tagSet).sort();
		for (const tag of sortedTags) {
			items.push({ type: "tag", value: tag });
		}

		if (!filterPath()) {
			const sortedPaths = Array.from(pathSet).sort();
			for (const path of sortedPaths) {
				items.push({ type: "path", value: path });
			}
		}

		return items;
	});
}
