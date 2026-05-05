import { JSX } from "solid-js";
import Button from "./Button";
import { Icon } from "./Icon";
import { useKanban } from "./KanbanContext";

export function PathNavigation(): JSX.Element {
	const { filterPath, setFilterPath } = useKanban();

	return (
		<div class="tb-path-filter">
			<Button class="text-icon-button" onClick={() => setFilterPath(undefined)}>
				<Icon iconId="arrow-left" />
				Back
			</Button>
			<div class="tb-path-text">{filterPath()}</div>
		</div>
	);
}
