export type TaskStatus = " " | "/" | "x";

export function getNextStatus(status: TaskStatus): TaskStatus {
	if (status === " ") return "/";
	if (status === "/") return "x";
	return " ";
}

export function parseStatus(input: string): TaskStatus | null {
	if (input === " " || input === "/") {
		return input;
	}
	if (input.toLowerCase() === "x") {
		return "x";
	}
	return null;
}
