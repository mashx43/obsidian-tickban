import { createSignal } from "solid-js";

export function createPopover() {
	const [ref, setRef] = createSignal<HTMLElement>();

	function isOpen(): boolean {
		return !!ref()?.matches(":popover-open");
	}

	function show(): void {
		if (!isOpen()) ref()?.showPopover();
	}

	function hide(): void {
		if (isOpen()) ref()?.hidePopover();
	}

	return { ref, setRef, isOpen, show, hide };
}
