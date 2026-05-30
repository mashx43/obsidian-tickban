import type { ComponentProps, JSX } from "solid-js";

export default function Button(props: ComponentProps<"div">): JSX.Element {
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			e.currentTarget?.dispatchEvent(
				new MouseEvent("click", { bubbles: true }),
			);
		}
	}

	return <div role="button" tabIndex={0} onKeyDown={onKeyDown} {...props} />;
}
