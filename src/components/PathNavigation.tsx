import { FilterPath } from "context/create-navigator";
import { useKanban } from "context/KanbanContext";
import type { JSX } from "solid-js";
import Button from "./ui/Button";
import { Icon } from "./ui/Icon";

export function PathNavigation(): JSX.Element {
	const { filterPath, zoomTask, goBack } = useKanban();

	function displayText(): FilterPath {
		const task = zoomTask();
		if (task) return task.text;

		return filterPath();
	}

	return (
		<div class="tb-path-filter">
			<Button class="text-icon-button" onClick={goBack}>
				<Icon iconId="arrow-left" />
				Back
			</Button>
			<div class="tb-path-text tb-ellipsis-text">{displayText()}</div>
		</div>
	);
}
