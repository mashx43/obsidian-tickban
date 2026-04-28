import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { TaskUpdater } from "core/task-updater";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	type JSX,
	onCleanup,
	onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { TickBanTask } from "../core/task-extractor";
import { Column } from "./Column";
import { TagFilter } from "./TagFilter";

const COLUMNS: { status: TickBanTask["status"]; title: string }[] = [
	{ status: "todo", title: "ToDo" },
	{ status: "doing", title: "Doing" },
	{ status: "done", title: "Done" },
];

interface KanbanBoardProps {
	loader: () => Promise<TickBanTask[]>;
	updater: TaskUpdater;
}

export function KanbanBoard(props: KanbanBoardProps): JSX.Element {
	const [tasks, setTasks] = createSignal<TickBanTask[]>([]);
	const [tagStore, setTagStore] = createStore<Record<string, boolean>>({});

	const allTags = createMemo(() => Object.keys(tagStore).sort());
	const activeTags = createMemo(() => allTags().filter((tag) => tagStore[tag]));

	async function loadTasks() {
		const extracted = await props.loader();
		setTasks(extracted);
	}

	// When a task is updated, add the new tag to the Store.
	createEffect(() => {
		for (const task of tasks()) {
			for (const tag of task.tags) {
				if (tagStore[tag] === undefined) {
					setTagStore(tag, false);
				}
			}
		}
	});

	onMount(() => {
		void loadTasks();

		const cleanup = monitorForElements({
			onDrop: ({ source, location }) => {
				const destination = location.current.dropTargets[0];
				if (!destination) {
					return;
				}

				const task = source.data.task as TickBanTask;
				const newStatus = destination.data.status as TickBanTask["status"];

				if (task.status === newStatus) {
					return;
				}

				// Optimistic UI update
				setTasks((prev) =>
					prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
				);

				// Actual vault update
				void props.updater(task, newStatus);
			},
		});

		onCleanup(() => cleanup());
	});

	const filteredTasks = createMemo(() => {
		const tags = activeTags();

		if (tags.length === 0) return tasks();
		return tasks().filter((task) =>
			tags.every((tag) => task.tags.includes(tag)),
		);
	});

	function filterByStatus(status: TickBanTask["status"]): TickBanTask[] {
		return filteredTasks().filter((t) => t.status === status);
	}

	function onTagClick(tag: string): void {
		setTagStore(tag, true);
	}

	return (
		<div class="tickban-container">
			<TagFilter
				store={tagStore}
				setStore={setTagStore}
				activeTags={activeTags()}
				allTags={allTags()}
			/>
			<div class="tickban-board">
				<For each={COLUMNS}>
					{(column) => (
						<Column
							{...column}
							tasks={filterByStatus(column.status)}
							onTagClick={onTagClick}
						/>
					)}
				</For>
			</div>
		</div>
	);
}
