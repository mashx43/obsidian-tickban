import type { JSX } from "solid-js";
import Button from "./Button";
import { Icon } from "./Icon";
import { useKanban } from "./KanbanContext";

export function PathNavigation(): JSX.Element {
	const { filterPath, setFilterPath, zoomTaskId, setZoomTaskId, zoomTask } =
		useKanban();

	function onBack() {
		if (zoomTaskId()) {
			setZoomTaskId(zoomTask()?.parentTaskId);
		} else {
			setFilterPath(undefined);
		}
	}

	const displayText = () => {
		const task = zoomTask();
		if (task) return task.text;

		return filterPath();
	};

	return (
		<div class="tb-path-filter">
			<Button class="text-icon-button" onClick={onBack}>
				<Icon iconId="arrow-left" />
				Back
			</Button>
			<div class="tb-path-text">{displayText()}</div>
		</div>
	);
}
