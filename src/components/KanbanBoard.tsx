import { For, type JSX, Show } from "solid-js";
import { useKanban } from "@/context/KanbanContext";
import type { TickbanTask } from "@/task";
import { COLUMNS } from "../constants";
import { Column } from "./Column";
import { TaskFilter } from "./filter/TaskFilter";
import { PathNavigation } from "./PathNavigation";

export function KanbanBoard(): JSX.Element {
	const { filteredTasks, filterPath, zoomTaskId } = useKanban();

	function filterByStatus(status: TickbanTask["status"]): TickbanTask[] {
		return filteredTasks().filter((t) => t.status === status);
	}

	return (
		<div class="tb-container">
			<Show when={filterPath() || zoomTaskId()}>
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
