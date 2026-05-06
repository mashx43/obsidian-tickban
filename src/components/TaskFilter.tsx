import { createFilter } from "./create-filter";
import { createPopover } from "primitives/create-popover";
import { For, Show } from "solid-js";
import { createList } from "solid-list";
import { Icon } from "./Icon";
import { useKanban } from "./KanbanContext";
import { TagToken } from "./TagToken";

export interface FilterItem {
	type: "tag" | "path";
	value: string;
}

export function TaskFilter() {
	const context = useKanban();
	const { activeTags, filterPath, setFilterPath, setTagStore } = context;
	const { inputValue, setInputValue, suggestions, clearAllTags } =
		createFilter(context);
	let containerRef: HTMLLabelElement | undefined;
	const popover = createPopover();
	const inputId = "tb-filter-input";
	const listboxId = "tb-filter-listbox";

	const { active, setActive, onKeyDown } = createList({
		items: () => suggestions().map((_, index) => index),
		handleTab: false,
	});

	function addFilter(item: FilterItem) {
		if (item.type === "tag") {
			setTagStore(item.value, true);
		} else {
			setFilterPath(item.value);
		}
		setInputValue("");
		setActive(null);
		popover.hide();
	}

	function removeTag(tag: string) {
		setTagStore(tag, false);
	}

	function scrollIntoView(): void {
		const index = active();
		if (index === null || !popover.isOpen()) return;

		const id = createOptionId(index);
		if (!id) return;

		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ block: "nearest" });
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		const { key } = e;

		if (key === "Enter") {
			const index = active();
			if (index === null) return;
			const selected = suggestions()[index];
			if (selected) {
				addFilter(selected);
			}
		} else if (key === "Backspace") {
			if (inputValue()) return;

			const tags = activeTags();
			const lastTag = tags[tags.length - 1];
			if (lastTag) {
				removeTag(lastTag);
			}
		} else if (key === "Escape") {
			setInputValue("");
			popover.hide();
		} else if (key === "ArrowDown") {
			if (popover.isOpen()) {
				onKeyDown(e);
				scrollIntoView();
			} else {
				popover.show();
			}
		} else {
			onKeyDown(e);
			scrollIntoView();
		}
	}

	function handleFocusOut(e: FocusEvent) {
		const target = e.relatedTarget as Node | null;
		if (containerRef?.contains(target)) return;
		popover.hide();
	}

	function createOptionId(index: number | null): string | undefined {
		if (index === null) return;
		return `filter-option-${index}`;
	}

	return (
		<>
			<label
				ref={containerRef}
				for={inputId}
				class="tb-filter-bar tb-text-input"
				onFocusOut={handleFocusOut}
				onKeyDown={handleKeyDown}
				onPointerDown={(e) => {
					if (popover.isOpen()) e.preventDefault();
				}}
			>
				<div class="tb-filter-list" role="list" aria-label="Active filters">
					<For each={activeTags()}>
						{(tag) => <TagToken tag={tag} onRemove={removeTag} />}
					</For>
					<input
						id={inputId}
						class="tb-filter-input"
						type="search"
						spellcheck={false}
						autocomplete="off"
						placeholder={
							activeTags().length === 0 && !filterPath()
								? "Filter by tags or paths..."
								: ""
						}
						value={inputValue()}
						onFocus={popover.show}
						onInput={(e) => {
							setInputValue(e.currentTarget.value);
							popover.show();
						}}
						role="combobox"
						aria-autocomplete="list"
						aria-expanded={popover.isOpen()}
						aria-haspopup="listbox"
						aria-controls={listboxId}
						aria-activedescendant={createOptionId(active())}
					/>
				</div>
				<Show when={activeTags().length || inputValue()}>
					<button
						class="clickable-icon"
						type="button"
						onClick={(e) => {
							e.preventDefault();
							clearAllTags();
						}}
						aria-label="Clear all filters"
					>
						<Icon iconId="x" />
					</button>
				</Show>
			</label>

			<ul
				id={listboxId}
				ref={popover.setRef}
				role="listbox"
				class="tb-filter-dropdown"
				popover="manual"
				onFocusOut={handleFocusOut}
				onPointerDown={(e) => e.preventDefault()}
			>
				<For
					each={suggestions()}
					fallback={<li class="tb-filter-option">No suggestions</li>}
				>
					{(item, index) => (
						<li
							id={createOptionId(index())}
							role="option"
							class="tb-filter-option"
							aria-selected={active() === index()}
							onMouseMove={[setActive, index()]}
							onClick={[addFilter, item]}
						>
							<span class="tb-filter-option-text">{item.value}</span>
						</li>
					)}
				</For>
			</ul>
		</>
	);
}
