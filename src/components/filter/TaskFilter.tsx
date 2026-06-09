import { For, onMount, Show } from "solid-js";
import { Icon } from "@/components/ui/Icon";
import { TagToken } from "@/components/ui/TagToken";
import { useKanban } from "@/context/KanbanContext";
import { createFilter } from "./create-filter";
import { FilterSuggest } from "./FilterSuggest";

export interface FilterItem {
	type: "tag" | "path";
	value: string;
}

export function TaskFilter() {
	const context = useKanban();
	const { app, activeTags, filterPath, setFilterPath, setTagStore } = context;
	const { inputValue, setInputValue, allItems, clearAllTags } =
		createFilter(context);
	let inputRef: HTMLInputElement | undefined;
	const inputId = "tb-filter-input";

	onMount(() => {
		if (!inputRef) return;
		new FilterSuggest(
			app,
			inputRef,
			() => allItems(),
			(item) => {
				if (item.type === "tag") {
					setTagStore(item.value, true);
				} else {
					setFilterPath(item.value);
				}
				setInputValue("");
			},
		);
	});

	function handleKeyDown(e: KeyboardEvent) {
		const { key } = e;

		if (key === "Backspace") {
			if (inputValue()) return;

			const tags = activeTags();
			const lastTag = tags[tags.length - 1];
			if (lastTag) {
				setTagStore(lastTag, false);
				inputRef?.focus();
			}
		} else if (key === "ArrowDown") {
			inputRef?.dispatchEvent(new Event("input"));
		}
	}

	return (
		<label for={inputId} class="tb-filter-bar tb-text-input">
			<div class="tb-filter-list" role="list" aria-label="Active filters">
				<For each={activeTags()}>
					{(tag) => (
						<TagToken
							tag={tag}
							onRemove={(t) => {
								setTagStore(t, false);
								inputRef?.focus();
							}}
						/>
					)}
				</For>
				<input
					id={inputId}
					ref={inputRef}
					class="tb-filter-input"
					type="search"
					spellcheck={false}
					autocomplete="off"
					placeholder={`Filter by tags${filterPath() ? "" : " or paths"}...`}
					value={inputValue()}
					onInput={(e) => setInputValue(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
				/>
			</div>

			<Show when={activeTags().length || inputValue()}>
				<button
					class="clickable-icon"
					type="button"
					onClick={(e) => {
						e.preventDefault();
						clearAllTags();
						inputRef?.focus();
					}}
					aria-label="Clear all filters"
				>
					<Icon iconId="x" />
				</button>
			</Show>
		</label>
	);
}
