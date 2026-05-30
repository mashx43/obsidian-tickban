import { useKanban } from "context/KanbanContext";
import { For, type JSX, Show } from "solid-js";
import { TickbanTask } from "task";

interface Props {
	task: TickbanTask;
}
export default function CardTags(props: Props): JSX.Element {
	const { onTagClick } = useKanban();

	return (
		<Show when={props.task.tags.length}>
			<div class="tb-card-tags">
				<For each={props.task.tags}>
					{(tag) => (
						<button
							type="button"
							class="tb-tag clickable-icon"
							tabIndex={-1}
							onClick={(e) => {
								e.stopPropagation();
								onTagClick(tag);
							}}
						>
							<span class="tb-ellipsis-text">{tag}</span>
						</button>
					)}
				</For>
			</div>
		</Show>
	);
}
