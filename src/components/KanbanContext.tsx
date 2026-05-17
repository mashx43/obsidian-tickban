import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { TaskNavigator } from "core/task-navigator";
import type { TaskUpdater } from "core/task-updater";
import { debounce } from "obsidian";
import type { TickbanSettings } from "settings";
import {
	type Accessor,
	createContext,
	createMemo,
	createSignal,
	type JSX,
	onCleanup,
	onMount,
	useContext,
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { REFRESH_EVENT } from "../constants";
import type { TaskExtractor, TickbanTask } from "../core/task-extractor";
import { createTags } from "../primitives/create-tags";

export type FilterPath = string | undefined;

export interface KanbanContextValue {
	tasks: Accessor<TickbanTask[]>;
	filteredTasks: Accessor<TickbanTask[]>;
	filterPath: Accessor<FilterPath>;
	setFilterPath: (path: FilterPath) => void;
	tagStore: Record<string, boolean>;
	setTagStore: SetStoreFunction<Record<string, boolean>>;
	activeTags: Accessor<string[]>;
	onTagClick: (tag: string) => void;
	navigator: TaskNavigator;
	updater: TaskUpdater;
	settings: TickbanSettings;
}

const KanbanContext = createContext<KanbanContextValue>();

export function useKanban() {
	const context = useContext(KanbanContext);
	if (!context) {
		throw new Error("useKanban must be used within a KanbanProvider");
	}
	return context;
}

interface KanbanProviderProps {
	extractor: TaskExtractor;
	updater: TaskUpdater;
	navigator: TaskNavigator;
	settings: TickbanSettings;
	contentEl: HTMLElement;
	children: JSX.Element;
}

export function KanbanProvider(props: KanbanProviderProps) {
	const [tasks, setTasks] = createSignal<TickbanTask[]>([]);
	const {
		store: tagStore,
		setStore: setTagStore,
		active: activeTags,
	} = createTags(tasks);
	const [filterPath, setFilterPath] = createSignal<FilterPath>();
	const [priorityTaskIds, setPriorityTaskIds] = createSignal<string[]>([]);
	const priorityMap = createMemo(
		() => new Map(priorityTaskIds().map((id, index) => [id, index])),
	);
	let isUpdating = false;

	async function loadTasks() {
		const { extractor, settings } = props;
		const { includeGlob, excludeGlob, hideDoneAfterDays } = settings;

		const extracted = await extractor(
			includeGlob,
			excludeGlob,
			hideDoneAfterDays,
		);
		setTasks(extracted);
	}

	async function updateTaskStatus(
		task: TickbanTask,
		newStatus: TickbanTask["status"],
	) {
		if (task.status === newStatus) return;

		// Optimistic UI update
		setTasks((prev) =>
			prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
		);
		setPriorityTaskIds((prev) => [
			task.id,
			...prev.filter((id) => id !== task.id),
		]);

		// Actual vault update
		try {
			isUpdating = true;
			await props.updater(task, newStatus);
		} finally {
			isUpdating = false;
		}
	}

	onMount(() => {
		const { contentEl } = props;
		void loadTasks();

		const debouncedRefresh = debounce(() => {
			void loadTasks();
		}, 500);

		function handleRefresh() {
			if (!isUpdating) {
				debouncedRefresh();
			}
		}

		contentEl.addEventListener(REFRESH_EVENT, handleRefresh);

		const cleanup = monitorForElements({
			onDrop: ({ source, location }) => {
				const destination = location.current.dropTargets[0];
				if (!destination) return;

				const task = source.data.task as TickbanTask;
				const newStatus = destination.data.status as TickbanTask["status"];
				void updateTaskStatus(task, newStatus);
			},
		});

		onCleanup(() => {
			cleanup();
			contentEl.removeEventListener(REFRESH_EVENT, handleRefresh);
		});
	});

	const filteredTasks = createMemo(() => {
		const tags = activeTags();
		const path = filterPath();
		const priorities = priorityMap();
		const hasTags = !!tags.length;

		const filtered =
			!hasTags && !path
				? tasks()
				: tasks().filter((task) => {
						const matchesPath = !path || task.filePath === path;
						if (!matchesPath) return false;

						const matchesTags =
							!hasTags || tags.every((tag) => task.tags.includes(tag));
						return matchesTags;
					});

		if (!priorities.size) return filtered;

		return [...filtered].sort((a, b) => {
			const aIndex = priorities.get(a.id);
			const bIndex = priorities.get(b.id);

			if (aIndex !== undefined && bIndex !== undefined) {
				return aIndex - bIndex;
			}
			if (aIndex !== undefined) return -1;
			if (bIndex !== undefined) return 1;

			return 0;
		});
	});

	function onTagClick(tag: string): void {
		setTagStore(tag, true);
	}

	const value: KanbanContextValue = {
		tasks,
		filteredTasks,
		filterPath,
		setFilterPath,
		tagStore,
		setTagStore,
		activeTags,
		onTagClick,
		navigator: props.navigator,
		updater: updateTaskStatus,
		settings: props.settings,
	};

	return (
		<KanbanContext.Provider value={value}>
			{props.children}
		</KanbanContext.Provider>
	);
}
