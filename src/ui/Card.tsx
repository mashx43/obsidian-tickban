import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { TickBanTask } from "../core/task-extractor";

interface CardProps {
	task: TickBanTask;
	onTagClick: (tag: string) => void;
}

export function Card(props: CardProps) {
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
		<div ref={ref} class="tickban-card" bool:data-dragging={isDragging()}>
			<div class="tickban-card-text">{props.task.text}</div>

			<Show when={props.task.tags.length > 0}>
				<div class="tickban-card-tags">
					<For each={props.task.tags}>
						{(tag) => (
							<button
								type="button"
								class="tickban-card-tag clickable-icon"
								tabIndex={-1}
								onClick={(e) => {
									e.stopPropagation();
									props.onTagClick(tag);
								}}
							>
								{tag}
							</button>
						)}
					</For>
				</div>
			</Show>

			<div class="tickban-card-meta">{props.task.filePath}</div>
		</div>
	);
}
