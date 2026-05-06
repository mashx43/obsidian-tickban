import type { ComponentProps, JSX } from "solid-js";

export default function Button(props: ComponentProps<"div">): JSX.Element {
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			(e.target as HTMLButtonElement)?.click?.();
		}
	}

	return <div role="button" tabIndex={0} onKeyDown={onKeyDown} {...props} />;
}
