import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { useKanban } from "context/KanbanContext";
import { Menu } from "obsidian";
import {
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { render } from "solid-js/web";
import { reveal, type TickbanTask } from "task";
import { COLUMNS } from "../../constants";
import Button from "../ui/Button";
import { Icon } from "../ui/Icon";
import CardFilePath from "./CardFilePath";
import CardSubTasks from "./CardSubtasks";
import CardTags from "./CardTags";

interface CardProps {
	task: TickbanTask;
	tabIndex: number;
}

export function Card(props: CardProps) {
	const { app, tasks, updater, setZoomTaskId } = useKanban();
	let ref: HTMLDivElement | undefined;
	const [isDragging, setIsDragging] = createSignal(false);
	let isOpen = false;
	let lastClosed = 0;

	const subtasks = createMemo(() =>
		tasks().filter((t) => t.parentTaskId === props.task.id),
	);

	const hasUnfinishedDescendants = createMemo(() => {
		const allTasks = tasks();
		function checkUnfinished(taskId: string): boolean {
			const children = allTasks.filter((t) => t.parentTaskId === taskId);
			for (const child of children) {
				if (child.status !== "x" || checkUnfinished(child.id)) return true;
			}
			return false;
		}
		return checkUnfinished(props.task.id);
	});

	const hasWarning = createMemo(
		() => props.task.status === "x" && hasUnfinishedDescendants(),
	);

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

	function createMenu(): Menu {
		const menu = new Menu();

		menu.addItem((item) =>
			item
				.setTitle("Open task in file")
				.setIcon("external-link")
				.onClick(() => reveal(app, props.task)),
		);

		menu.addItem((item) =>
			item
				.setTitle("Zoom into this task")
				.setIcon("zoom-in")
				.setDisabled(subtasks().length === 0)
				.onClick(() => setZoomTaskId(props.task.id)),
		);

		menu.addSeparator();

		for (const column of COLUMNS) {
			menu.addItem((item) =>
				item
					.setTitle(column.title)
					.setIcon(column.icon)
					.setChecked(props.task.status === column.status)
					.onClick(() => updater(props.task, column.status)),
			);
		}

		isOpen = true;
		menu.onHide(() => {
			isOpen = false;
			lastClosed = Date.now();
		});

		return menu;
	}

	function onClick(e: MouseEvent): void {
		e.preventDefault();

		if (Date.now() - lastClosed < 100) return;

		const menu = createMenu();
		menu.showAtMouseEvent(e);
	}

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();

			const el = e.currentTarget as HTMLElement;
			const { left, bottom } = el.getBoundingClientRect();

			const menu = createMenu();
			menu.showAtPosition({ x: left, y: bottom });
		} else if (e.key === "Tab") {
			// Focus trapping does not work in mobile view.
			if (isOpen) e.preventDefault();
		}
	}

	return (
		<Button
			ref={ref}
			class="tb-card"
			tabIndex={props.tabIndex}
			bool:data-dragging={isDragging()}
			onClick={onClick}
			onKeyDown={onKeyDown}
		>
			<Show when={hasWarning()}>
				<div class="tb-card-warning-text">
					<Icon iconId="alert-triangle" />
					Unfinished subtasks
				</div>
			</Show>

			<div class="tb-card-text">{props.task.text}</div>

			<CardSubTasks subtasks={subtasks()} />
			<CardTags {...props} />
			<CardFilePath {...props} />
		</Button>
	);
}
