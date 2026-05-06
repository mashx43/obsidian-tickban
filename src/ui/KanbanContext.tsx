import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { TaskNavigator } from "core/task-navigator";
import type { TaskUpdater } from "core/task-updater";
import { TickBanSettings } from "settings";
import {
	Accessor,
	createContext,
	createMemo,
	createSignal,
	JSX,
	onCleanup,
	onMount,
	useContext,
} from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import type { TaskExtractor, TickBanTask } from "../core/task-extractor";
import { createTags } from "./createTags";

export type FilterPath = string | undefined;

export interface KanbanContextValue {
	tasks: Accessor<TickBanTask[]>;
	filteredTasks: Accessor<TickBanTask[]>;
	filterPath: Accessor<FilterPath>;
	setFilterPath: (path: FilterPath) => void;
	tagStore: Record<string, boolean>;
	setTagStore: SetStoreFunction<Record<string, boolean>>;
	activeTags: Accessor<string[]>;
	onTagClick: (tag: string) => void;
	navigator: TaskNavigator;
	settings: TickBanSettings;
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
	settings: TickBanSettings;
	children: JSX.Element;
}

export function KanbanProvider(props: KanbanProviderProps) {
	const [tasks, setTasks] = createSignal<TickBanTask[]>([]);
	const {
		store: tagStore,
		setStore: setTagStore,
		active: activeTags,
	} = createTags(tasks);
	const [filterPath, setFilterPath] = createSignal<FilterPath>();

	async function loadTasks() {
		const { includeGlob, excludeGlob } = props.settings;
		const extracted = await props.extractor(includeGlob, excludeGlob);
		setTasks(extracted);
	}

	onMount(() => {
		void loadTasks();

		const cleanup = monitorForElements({
			onDrop: ({ source, location }) => {
				const destination = location.current.dropTargets[0];
				if (!destination) return;

				const task = source.data.task as TickBanTask;
				const newStatus = destination.data.status as TickBanTask["status"];
				if (task.status === newStatus) return;

				// Optimistic UI update
				setTasks((prev) =>
					prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
				);

				// Actual vault update
				void props.updater(task, newStatus);
			},
		});

		onCleanup(() => cleanup());
	});

	const filteredTasks = createMemo(() => {
		const tags = activeTags();
		const path = filterPath();

		if (tags.length === 0 && path === undefined) return tasks();

		return tasks().filter((task) => {
			const matchesPath = !path || task.filePath === path;
			if (!matchesPath) return false;

			const matchesTags =
				tags.length === 0 || tags.every((tag) => task.tags.includes(tag));
			return matchesTags;
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
		settings: props.settings,
	};

	return (
		<KanbanContext.Provider value={value}>
			{props.children}
		</KanbanContext.Provider>
	);
}
