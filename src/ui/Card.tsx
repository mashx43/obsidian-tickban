import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { TickBanTask } from "../core/task-extractor";
import Button from "./Button";
import { Icon } from "./Icon";
import { useKanban } from "./KanbanContext";

interface CardProps {
	task: TickBanTask;
}

export function Card(props: CardProps) {
	const { onTagClick, navigator, filterPath, setFilterPath, settings } =
		useKanban();
	let ref: HTMLDivElement | undefined;
	const [isDragging, setIsDragging] = createSignal(false);

	onMount(() => {
		if (!ref) return;
		const cleanup = draggable({
			element: ref,
			getInitialData: () => ({ task: props.task }),
			onDragStart: () => setIsDragging(true),
			onDrop: () => setIsDragging(false),
		});
		onCleanup(() => cleanup());
	});

	return (
		<div ref={ref} class="tb-card" bool:data-dragging={isDragging()}>
			<div class="tb-card-text">{props.task.text}</div>
			<button
				type="button"
				class="tb-card-open-button clickable-icon"
				aria-label="Open task in file"
				onClick={(e) => {
					e.stopPropagation();
					navigator(props.task);
				}}
			>
				<Icon iconId="external-link" />
			</button>

			<Show when={props.task.tags.length > 0}>
				<div class="tb-card-tags">
					<For each={props.task.tags}>
						{(tag) => (
							<button
								type="button"
								class="tb-tag clickable-icon"
								tabIndex={-1}
								onClick={(e) => {
									e.stopPropagation();
									onTagClick(tag);
								}}
							>
								{tag}
							</button>
						)}
					</For>
				</div>
			</Show>

			<Show when={settings.showFilePath && !filterPath()}>
				<Button
					class="tb-card-path-button text-icon-button"
					tabIndex={-1}
					onClick={(e) => {
						e.stopPropagation();
						setFilterPath(props.task.filePath);
					}}
				>
					{props.task.filePath}
				</Button>
			</Show>
		</div>
	);
}
