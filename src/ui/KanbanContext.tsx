import { createContext, useContext } from "solid-js";
import type { TickBanTask } from "../core/task-extractor";
import { FilterPath } from "./KanbanBoard";

interface KanbanContextValue {
	filterPath: () => FilterPath;
	setFilterPath: (path: FilterPath) => void;
	onTagClick: (tag: string) => void;
	onOpenTask: (task: TickBanTask) => void;
	showFilePath: boolean;
}

const KanbanContext = createContext<KanbanContextValue>();

export function useKanban() {
	const context = useContext(KanbanContext);
	if (!context) {
		throw new Error("useKanban must be used within a KanbanProvider");
	}
	return context;
}

export const KanbanProvider = KanbanContext.Provider;
