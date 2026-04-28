import { usePopover } from "hooks/popover";
import { batch, createMemo, createSignal, For, Show } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { createList } from "solid-list";
import { Icon } from "./Icon";
import { TagToken } from "./TagToken";

interface TagFilterProps {
	store: Record<string, boolean>;
	setStore: SetStoreFunction<Record<string, boolean>>;
	allTags: string[];
	activeTags: string[];
}

export function TagFilter(props: TagFilterProps) {
	let containerRef: HTMLLabelElement | undefined;
	const [inputValue, setInputValue] = createSignal("");
	const popover = usePopover();
	const inputId = "tb-tag-input";
	const listboxId = "tb-tag-listbox";

	const filteredSuggestions = createMemo(() => {
		const query = inputValue().toLowerCase();
		return props.allTags.filter(
			(tag) =>
				!props.store[tag] && (!query || tag.toLowerCase().includes(query)),
		);
	});

	const { active, setActive, onKeyDown } = createList({
		items: filteredSuggestions,
		handleTab: false,
	});

	function toggleTag(tag: string) {
		props.setStore(tag, (prev) => !prev);
	}

	function addTag(tag: string) {
		toggleTag(tag);
		setInputValue("");
		setActive(null);
		popover.hide();
	}

	function handleKeyDown(e: KeyboardEvent) {
		const { key } = e;

		if (key === "Enter") {
			const selected = active();
			if (selected) {
				addTag(selected);
			}
		} else if (key === "Backspace") {
			if (inputValue()) return;

			const lastTag = props.activeTags.last();
			if (lastTag) {
				toggleTag(lastTag);
			}
		} else if (key === "Escape") {
			setInputValue("");
			popover.hide();
		} else if (key === "ArrowDown") {
			if (popover.isOpen()) {
				onKeyDown(e);
			} else {
				popover.show();
			}
		} else {
			onKeyDown(e);
		}
	}

	function handleFocusOut(e: FocusEvent) {
		const target = e.relatedTarget as Node | null;
		if (containerRef?.contains(target)) return;
		popover.hide();
	}

	function clearAll() {
		batch(() => {
			setInputValue("");
			for (const tag of props.activeTags) {
				props.setStore(tag, false);
			}
		});
	}

	function createTagOptionId(tag: string | null): string | undefined {
		return tag ? `tag-option-${tag}` : undefined;
	}

	return (
		<>
			<label
				ref={containerRef}
				for={inputId}
				class="tb-tag-filter"
				onFocusOut={handleFocusOut}
				onKeyDown={handleKeyDown}
				onPointerDown={(e) => {
					if (popover.isOpen()) e.preventDefault();
				}}
			>
				<div class="tb-tag-list" role="list" aria-label="Selected tags">
					<For each={props.activeTags}>
						{(tag) => <TagToken tag={tag} onRemove={toggleTag} />}
					</For>
					<input
						id={inputId}
						class="tb-tag-input"
						type="search"
						spellcheck={false}
						autocomplete="off"
						placeholder={
							props.activeTags.length === 0 ? "Filter by tags..." : ""
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
						aria-activedescendant={createTagOptionId(active())}
					/>
				</div>
				<Show when={props.activeTags.length || inputValue()}>
					<button
						class="clickable-icon"
						type="button"
						onClick={(e) => {
							e.preventDefault();
							clearAll();
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
				class="tb-tag-dropdown"
				popover="manual"
				onFocusOut={handleFocusOut}
				onPointerDown={(e) => e.preventDefault()}
			>
				<For
					each={filteredSuggestions()}
					fallback={<li class="tb-tag-option">No suggestions</li>}
				>
					{(tag) => (
						<li
							id={createTagOptionId(tag)}
							role="option"
							class="tb-tag-option"
							aria-selected={active() === tag}
							onMouseMove={[setActive, tag]}
							onClick={[addTag, tag]}
						>
							{tag}
						</li>
					)}
				</For>
			</ul>
		</>
	);
}
