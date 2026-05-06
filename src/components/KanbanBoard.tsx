import { For, type JSX, Show } from "solid-js";
import type { TickbanTask } from "../core/task-extractor";
import { Column } from "./Column";
import { useKanban } from "./KanbanContext";
import { PathNavigation } from "./PathNavigation";
import { TaskFilter } from "./TaskFilter";

const COLUMNS: {
	status: TickbanTask["status"];
	title: string;
	icon: string;
}[] = [
	{ status: "todo", title: "ToDo", icon: "square" },
	{ status: "doing", title: "Doing", icon: "square-pen" },
	{ status: "done", title: "Done", icon: "square-check-big" },
];

export function KanbanBoard(): JSX.Element {
	const { filteredTasks, filterPath } = useKanban();

	function filterByStatus(status: TickbanTask["status"]): TickbanTask[] {
		return filteredTasks().filter((t) => t.status === status);
	}

	return (
		<div class="tb-container">
			<Show when={filterPath()}>
				<PathNavigation />
			</Show>
			<TaskFilter />
			<div class="tb-board">
				<For each={COLUMNS}>
					{(column) => (
						<Column {...column} tasks={filterByStatus(column.status)} />
					)}
				</For>
			</div>
		</div>
	);
}
