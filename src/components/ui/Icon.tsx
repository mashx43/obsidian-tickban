import { getIcon, type IconName } from "obsidian";
import type { JSX } from "solid-js";

interface Props {
	iconId: IconName;
}
export function Icon(props: Props): JSX.Element {
	return getIcon(props.iconId);
}
