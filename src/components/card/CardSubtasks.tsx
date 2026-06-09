import { For, type JSX, Show } from "solid-js";
import { useKanban } from "@/context/KanbanContext";
import { getNextStatus, type TickbanTask } from "@/task";

interface Props {
	subtasks: TickbanTask[];
}
export default function CardSubTasks(props: Props): JSX.Element {
	const { updater } = useKanban();

	function toggleSubtask(task: TickbanTask) {
		void updater(task, getNextStatus(task.status));
	}

	return (
		<Show when={props.subtasks.length}>
			<div class="tb-card-subtasks">
				<For each={props.subtasks}>
					{(subtask) => (
						<label
							class="tb-card-subtask-item"
							onClick={(e) => e.stopPropagation()}
						>
							<input
								type="checkbox"
								checked={subtask.status !== " "}
								tabIndex={-1}
								data-task={subtask.status}
								onClick={(e) => {
									e.preventDefault();
									toggleSubtask(subtask);
								}}
							/>
							<span class="tb-card-subtask-text tb-ellipsis-text">
								{subtask.text}
							</span>
						</label>
					)}
				</For>
			</div>
		</Show>
	);
}
