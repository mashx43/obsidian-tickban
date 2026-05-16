import { For, type JSX, Show } from "solid-js";
import { COLUMNS } from "../constants";
import type { TickbanTask } from "../core/task-extractor";
import { Column } from "./Column";
import { useKanban } from "./KanbanContext";
import { PathNavigation } from "./PathNavigation";
import { TaskFilter } from "./TaskFilter";

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
