import { Accessor, batch, createMemo, createSignal } from "solid-js";
import { FilterPath } from "./KanbanBoard";
import { useKanban } from "./KanbanContext";
import { FilterItem, FilterProps } from "./TaskFilter";

export function useFilter(props: FilterProps) {
	const { filterPath, setFilterPath } = useKanban();
	const [inputValue, setInputValue] = createSignal("");
	const suggestions = createSuggestions(props, filterPath, inputValue);

	function clearAllTags() {
		batch(() => {
			setInputValue("");
			for (const tag of props.activeTags) {
				props.setTagStore(tag, false);
			}
		});
	}

	return {
		filterPath,
		setFilterPath,
		inputValue,
		setInputValue,
		suggestions,
		clearAllTags,
	};
}

function createSuggestions(
	props: FilterProps,
	filterPath: Accessor<FilterPath>,
	inputValue: Accessor<string>,
): Accessor<FilterItem[]> {
	const availableTags = createMemo(() => {
		const tags = new Set<string>();
		for (const task of props.filteredTasks) {
			for (const tag of task.tags) {
				tags.add(tag);
			}
		}
		return Array.from(tags).sort();
	});

	const availablePaths = createMemo(() => {
		const paths = new Set<string>();
		for (const task of props.filteredTasks) {
			paths.add(task.filePath);
		}
		return Array.from(paths).sort();
	});

	return createMemo<FilterItem[]>(() => {
		const query = inputValue().toLowerCase();
		const items: FilterItem[] = [];

		// Tags
		for (const tag of availableTags()) {
			if (!props.tagStore[tag] && searchText(tag, query)) {
				items.push({ type: "tag", value: tag });
			}
		}

		// Paths
		if (filterPath()) return items;

		for (const path of availablePaths()) {
			if (searchText(path, query)) {
				items.push({ type: "path", value: path });
			}
		}

		return items;
	});
}

function searchText(text: string, query: string): boolean {
	return !query || text.toLowerCase().includes(query);
}
