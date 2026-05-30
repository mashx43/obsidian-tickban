import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { type App, debounce } from "obsidian";
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
import {
	compileGlob,
	extract,
	type TaskStatus,
	type TickbanTask,
	update,
} from "task";
import { REFRESH_EVENT } from "../constants";
import { createTags } from "../primitives/create-tags";

export type FilterPath = string | undefined;

export interface KanbanContextValue {
	app: App;
	tasks: Accessor<TickbanTask[]>;
	filteredTasks: Accessor<TickbanTask[]>;
	filterPath: Accessor<FilterPath>;
	setFilterPath: (path: FilterPath) => void;
	zoomTaskId: Accessor<string | undefined>;
	setZoomTaskId: (id: string | undefined) => void;
	zoomTask: Accessor<TickbanTask | undefined>;
	tagStore: Record<string, boolean>;
	setTagStore: SetStoreFunction<Record<string, boolean>>;
	activeTags: Accessor<string[]>;
	onTagClick: (tag: string) => void;
	updater: (task: TickbanTask, newStatus: TaskStatus) => Promise<void>;
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
	app: App;
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
	const [zoomTaskId, setZoomTaskId] = createSignal<string>();
	const [priorityTaskIds, setPriorityTaskIds] = createSignal<string[]>([]);
	const priorityMap = createMemo(
		() => new Map(priorityTaskIds().map((id, index) => [id, index])),
	);
	let isUpdating = false;

	const zoomTask = createMemo(() => {
		const id = zoomTaskId();
		if (!id) return undefined;
		return tasks().find((t) => t.id === id);
	});

	const isIncluded = createMemo(() =>
		compileGlob(props.settings.includeGlob, () => true),
	);
	const isExcluded = createMemo(() =>
		compileGlob(props.settings.excludeGlob, () => false),
	);

	async function loadTasks() {
		const { app, settings } = props;
		const extracted = await extract(
			app,
			isIncluded(),
			isExcluded(),
			settings.hideDoneAfterDays,
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
			await update(props.app, task, newStatus);
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
		const zoomId = zoomTaskId();
		const priorities = priorityMap();
		const hasTags = !!tags.length;

		const filtered = tasks().filter((task) => {
			// Hierarchy filter:
			// If zoomed, show only children of the zoomed task.
			// If not zoomed, show only top-level tasks.
			const matchesHierarchy = zoomId
				? task.parentTaskId === zoomId
				: !task.parentTaskId;
			if (!matchesHierarchy) return false;

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
		app: props.app,
		tasks,
		filteredTasks,
		filterPath,
		setFilterPath,
		zoomTaskId,
		setZoomTaskId,
		zoomTask,
		tagStore,
		setTagStore,
		activeTags,
		onTagClick,
		updater: updateTaskStatus,
		settings: props.settings,
	};

	return (
		<KanbanContext.Provider value={value}>
			{props.children}
		</KanbanContext.Provider>
	);
}
