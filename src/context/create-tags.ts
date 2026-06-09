import { type Accessor, createEffect, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { TickbanTask } from "@/task";

export function createTags(tasks: Accessor<TickbanTask[]>) {
	const [store, setStore] = createStore<Record<string, boolean>>({});

	createEffect(() => {
		for (const task of tasks()) {
			for (const tag of task.tags) {
				if (store[tag] === undefined) {
					setStore(tag, false);
				}
			}
		}
	});

	const active = createMemo(() =>
		Object.keys(store)
			.filter((tag) => store[tag])
			.sort(),
	);

	return { store, setStore, active };
}
