import type { ComponentProps, JSX } from "solid-js";

interface Props extends ComponentProps<"div"> {}

export default function Button(props: Props): JSX.Element {
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			// @ts-expect-error
			e.target?.click?.();
		}
	}

	return <div role="button" tabIndex={0} onKeyDown={onKeyDown} {...props} />;
}
