import type { TaskStatus } from "@/task";

export const REFRESH_EVENT = "tickban-refresh-data";

export const COLUMNS: {
	status: TaskStatus;
	title: string;
	icon: string;
}[] = [
	{ status: " ", title: "ToDo", icon: "square" },
	{ status: "/", title: "Doing", icon: "square-pen" },
	{ status: "x", title: "Done", icon: "square-check-big" },
];
