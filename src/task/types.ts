import type { TaskStatus } from "./status";

export interface TickbanTask {
	id: string; // `${file.path}:${line}`
	filePath: string;
	line: number;
	text: string;
	status: TaskStatus;
	tags: string[];
	mtime: number;
	parentTaskId?: string;
}
