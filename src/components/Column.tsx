import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
	createEffect,
	createSignal,
	Index,
	onCleanup,
	onMount,
	untrack,
} from "solid-js";
import { createList } from "solid-list";
import type { TickbanTask } from "task";
import { Card } from "./Card";
import { Icon } from "./Icon";

interface ColumnProps {
	status: TickbanTask["status"];
	title: string;
	icon: string;
	tasks: TickbanTask[];
}

export function Column(props: ColumnProps) {
	let ref: HTMLDivElement | undefined;
	let listRef: HTMLDivElement | undefined;
	const [isHovered, setIsHovered] = createSignal(false);
	let isIgnore = false;

	function onActiveChange(active: number | null): void {
		if (active === null || isIgnore) return;
		const el = listRef?.children[active] as HTMLElement | undefined;
		if (el && document.activeElement !== el) {
			el.focus();
		}
	}

	const { active, setActive, onKeyDown } = createList({
		items: () => props.tasks.map((_, index) => index),
		initialActive: 0,
		handleTab: false,
		onActiveChange,
	});

	createEffect<number>((prev) => {
		const index = untrack(() => active());
		const currentLength = props.tasks.length;

		if (index === null || prev === currentLength) return currentLength;

		let newIndex = 0;
		if (prev > currentLength) {
			if (props.tasks[index]) return currentLength;
			newIndex = Math.max(index - 1, 0);
			isIgnore = true;
		}

		// Focus even with increased tasks and no index change.
		if (!isIgnore && index === newIndex) {
			onActiveChange(newIndex);
		} else {
			setActive(newIndex);
			isIgnore = false;
		}

		return currentLength;
	}, props.tasks.length);

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
		<div
			ref={ref}
			class="tb-column"
			bool:data-hover={isHovered()}
			onKeyDown={onKeyDown}
		>
			<h3 class="tb-column-title">
				<Icon iconId={props.icon} />
				{props.title}
				<span class="flair">{props.tasks.length}</span>
			</h3>
			<div ref={listRef} class="tb-column-content">
				<Index each={props.tasks}>
					{(task, index) => (
						<Card task={task()} tabIndex={active() === index ? 0 : -1} />
					)}
				</Index>
			</div>
		</div>
	);
}
