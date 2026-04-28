import type { JSX } from "solid-js";
import { Icon } from "./Icon";

interface Props {
	tag: string;
	onRemove: (tag: string) => void;
}

export function TagToken(props: Props): JSX.Element {
	return (
		<span class="tickban-tag-token" role="listitem">
			{props.tag}
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
