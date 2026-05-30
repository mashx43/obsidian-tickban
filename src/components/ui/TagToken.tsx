import type { JSX } from "solid-js";
import { Icon } from "./Icon";

interface Props {
	tag: string;
	onRemove: (tag: string) => void;
}

export function TagToken(props: Props): JSX.Element {
	return (
		<span class="tb-tag" role="listitem">
			<span class="tb-ellipsis-text">{props.tag}</span>
			<button
				type="button"
				class="clickable-icon"
				onClick={(e) => {
					e.preventDefault();
					props.onRemove(props.tag);
				}}
				aria-label={`Remove tag ${props.tag}`}
			>
				<Icon iconId="x" />
			</button>
		</span>
	);
}
