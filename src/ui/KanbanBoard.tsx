import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { TaskUpdater } from "core/task-updater";
import {
	createMemo,
	createSignal,
	For,
	type JSX,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import type { TickBanTask } from "../core/task-extractor";
import { Column } from "./Column";
import { createTags } from "./createTags";
import { KanbanProvider } from "./KanbanContext";
import { PathNavigation } from "./PathNavigation";
import { TaskFilter } from "./TaskFilter";

const COLUMNS: {
	status: TickBanTask["status"];
	title: string;
	icon: string;
}[] = [
	{ status: "todo", title: "ToDo", icon: "square" },
	{ status: "doing", title: "Doing", icon: "square-pen" },
	{ status: "done", title: "Done", icon: "square-check-big" },
];

export type FilterPath = string | undefined;

interface KanbanBoardProps {
	loader: () => Promise<TickBanTask[]>;
	updater: TaskUpdater;
	onOpenTask: (task: TickBanTask) => void;
}

export function KanbanBoard(props: KanbanBoardProps): JSX.Element {
	const [tasks, setTasks] = createSignal<TickBanTask[]>([]);
	const {
		store: tagStore,
		setStore: setTagStore,
		active: activeTags,
	} = createTags(tasks);
	const [filterPath, setFilterPath] = createSignal<FilterPath>();

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

	const filteredTasks = createMemo(() => {
		const tags = activeTags();
		const path = filterPath();

		if (tags.length === 0 && path === undefined) return tasks();

		return tasks().filter((task) => {
			const matchesPath = !path || task.filePath === path;
			if (!matchesPath) return false;

			const matchesTags =
				tags.length === 0 || tags.every((tag) => task.tags.includes(tag));
			return matchesTags;
		});
	});

	function filterByStatus(status: TickBanTask["status"]): TickBanTask[] {
		return filteredTasks().filter((t) => t.status === status);
	}

	function onTagClick(tag: string): void {
		setTagStore(tag, true);
	}

	return (
		<KanbanProvider
			value={{
				filterPath,
				setFilterPath,
				onTagClick,
				onOpenTask: props.onOpenTask,
			}}
		>
			<div class="tb-container">
				<Show when={filterPath()}>
					<PathNavigation />
				</Show>
				<TaskFilter
					filteredTasks={filteredTasks()}
					tagStore={tagStore}
					setTagStore={setTagStore}
					activeTags={activeTags()}
				/>
				<div class="tb-board">
					<For each={COLUMNS}>
						{(column) => (
							<Column {...column} tasks={filterByStatus(column.status)} />
						)}
					</For>
				</div>
			</div>
		</KanbanProvider>
	);
}
