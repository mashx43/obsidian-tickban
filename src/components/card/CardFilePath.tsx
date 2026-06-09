import { type JSX, Show } from "solid-js";
import Button from "@/components/ui/Button";
import { useKanban } from "@/context/KanbanContext";
import type { TickbanTask } from "@/task";

interface Props {
	task: TickbanTask;
}
export default function CardFilePath(props: Props): JSX.Element {
	const { filterPath, setFilterPath, settings } = useKanban();

	return (
		<Show when={settings.showFilePath && !filterPath()}>
			<Button
				class="tb-card-path-button text-icon-button"
				tabIndex={-1}
				onClick={(e) => {
					e.stopPropagation();
					setFilterPath(props.task.filePath);
				}}
			>
				<span class="tb-ellipsis-text">{props.task.filePath}</span>
			</Button>
		</Show>
	);
}
