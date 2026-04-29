import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { TickBanTask } from "../core/task-extractor";
import { Card } from "./Card";
import { Icon } from "./Icon";

interface ColumnProps {
	status: TickBanTask["status"];
	title: string;
	icon: string;
	tasks: TickBanTask[];
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
		<div ref={ref} class="tb-column" bool:data-hover={isHovered()}>
			<h3 class="tb-column-title">
				<Icon iconId={props.icon} />
				{props.title}
				<span class="flair">{props.tasks.length}</span>
			</h3>
			<div class="tb-column-content">
				<For each={props.tasks}>{(task) => <Card task={task} />}</For>
			</div>
		</div>
	);
}
