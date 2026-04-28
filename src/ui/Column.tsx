import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { TickBanTask } from "../core/task-extractor";
import { Card } from "./Card";

interface ColumnProps {
	status: TickBanTask["status"];
	title: string;
	tasks: TickBanTask[];
	onTagClick: (tag: string) => void;
	onOpenTask: (task: TickBanTask) => void;
}

export function Column(props: ColumnProps) {
	let ref: HTMLDivElement | undefined;
	const [isHovered, setIsHovered] = createSignal(false);

	onMount(() => {
		if (!ref) return;
		const cleanup = dropTargetForElements({
			element: ref,
			getData: () => ({ status: props.status }),
			onDragEnter: () => setIsHovered(true),
			onDragLeave: () => setIsHovered(false),
			onDrop: () => setIsHovered(false),
		});
		onCleanup(() => cleanup());
	});

	return (
		<div ref={ref} class="tickban-column" bool:data-hover={isHovered()}>
			<h3 class="tickban-column-title">
				{props.title} ({props.tasks.length})
			</h3>
			<div class="tickban-column-content">
				<For each={props.tasks}>
					{(task) => (
						<Card
							task={task}
							onTagClick={props.onTagClick}
							onOpenTask={props.onOpenTask}
						/>
					)}
				</For>
			</div>
		</div>
	);
}
