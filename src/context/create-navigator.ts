import { type Accessor, createMemo, createSignal } from "solid-js";
import type { TickbanTask } from "@/task";

export type FilterPath = string | undefined;

export function createNavigator(tasks: Accessor<TickbanTask[]>) {
	const [filterPath, setFilterPath] = createSignal<FilterPath>();
	const [zoomTaskId, setZoomTaskId] = createSignal<string>();

	const zoomTask = createMemo(() => {
		const id = zoomTaskId();
		if (!id) return undefined;
		return tasks().find((t) => t.id === id);
	});

	function goBack(): void {
		const task = zoomTask();
		if (task) {
			setZoomTaskId(task.parentTaskId);
		} else {
			setFilterPath(undefined);
		}
	}

	function matchesScope(
		task: TickbanTask,
		path: FilterPath,
		zoomId: string | undefined,
		activeTags: string[],
	): boolean {
		// Hierarchy filter
		const matchesHierarchy = zoomId
			? task.parentTaskId === zoomId
			: !task.parentTaskId;
		if (!matchesHierarchy) return false;

		// Path filter
		const matchesPath = !path || task.filePath === path;
		if (!matchesPath) return false;

		// Tag filter
		const matchesTags =
			!activeTags.length || activeTags.every((tag) => task.tags.includes(tag));
		return matchesTags;
	}

	return {
		filterPath,
		setFilterPath,
		zoomTaskId,
		setZoomTaskId,
		zoomTask,
		goBack,
		matchesScope,
	};
}
