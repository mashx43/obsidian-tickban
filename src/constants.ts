import type { TickbanTask } from "./core/task-extractor";

export const REFRESH_EVENT = "tickban-refresh-data";

export const COLUMNS: {
	status: TickbanTask["status"];
	title: string;
	icon: string;
}[] = [
	{ status: "todo", title: "ToDo", icon: "square" },
	{ status: "doing", title: "Doing", icon: "square-pen" },
	{ status: "done", title: "Done", icon: "square-check-big" },
];
