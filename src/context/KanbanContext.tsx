import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { type App, debounce } from "obsidian";
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
import type { TickbanSettings } from "@/settings";
import {
	compileGlob,
	extract,
	type TaskStatus,
	type TickbanTask,
	update,
} from "@/task";
import { REFRESH_EVENT } from "../constants";
import { createNavigator, type FilterPath } from "./create-navigator";
import { createTags } from "./create-tags";

export interface KanbanContextValue {
	app: App;
	tasks: Accessor<TickbanTask[]>;
	filteredTasks: Accessor<TickbanTask[]>;
	filterPath: Accessor<FilterPath>;
	setFilterPath: (path: FilterPath) => void;
	zoomTaskId: Accessor<string | undefined>;
	setZoomTaskId: (id: string | undefined) => void;
	zoomTask: Accessor<TickbanTask | undefined>;
	goBack: () => void;
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
	const navigator = createNavigator(tasks);
	const [priorityTaskIds, setPriorityTaskIds] = createSignal<string[]>([]);
	const priorityMap = createMemo(
		() => new Map(priorityTaskIds().map((id, index) => [id, index])),
	);
	let isUpdating = false;

	const isIncluded = createMemo(() =>
		compileGlob(props.settings.includeGlob, () => true),
	);
	const isExcluded = createMemo(() =>
		compileGlob(props.settings.excludeGlob, () => false),
	);

	async function loadTasks() {
		const { app, settings } = props;
		const extracted = await extract(app, settings, isIncluded(), isExcluded());
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
		const path = navigator.filterPath();
		const zoomId = navigator.zoomTaskId();
		const priorities = priorityMap();

		const filtered = tasks().filter((task) =>
			navigator.matchesScope(task, path, zoomId, tags),
		);

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
		...navigator,
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
