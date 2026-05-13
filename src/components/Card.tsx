import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import type { TickbanTask } from "../core/task-extractor";
import Button from "./Button";
import { Icon } from "./Icon";
import { useKanban } from "./KanbanContext";

interface CardProps {
	task: TickbanTask;
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
			onGenerateDragPreview: ({ nativeSetDragImage }) => {
				setCustomNativeDragPreview({
					nativeSetDragImage,
					getOffset: pointerOutsideOfPreview({
						x: "4px",
						y: "6px",
					}),
					render({ container }) {
						const cleanup = render(
							() => (
								<div class="drag-ghost">
									<div>{props.task.text}</div>
									<div class="drag-ghost-action tb-drag-preview-tags">
										<For each={props.task.tags}>
											{(tag) => <span>{tag}</span>}
										</For>
									</div>
								</div>
							),
							container,
						);
						return () => cleanup();
					},
				});
			},
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
