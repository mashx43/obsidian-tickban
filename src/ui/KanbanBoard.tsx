import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { TaskUpdater } from "core/task-updater";
import { createSignal, For, type JSX, onCleanup, onMount } from "solid-js";
import type { TickBanTask } from "../core/task-extractor";
import { Column } from "./Column";

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

	async function loadTasks() {
		const extracted = await props.loader();
		setTasks(extracted);
	}

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

	function filterByStatus(status: TickBanTask["status"]): TickBanTask[] {
		return tasks().filter((t) => t.status === status);
	}

	return (
		<div class="tickban-container">
			<div class="tickban-board">
				<For each={COLUMNS}>
					{(column) => (
						<Column {...column} tasks={filterByStatus(column.status)} />
					)}
				</For>
			</div>
		</div>
	);
}
