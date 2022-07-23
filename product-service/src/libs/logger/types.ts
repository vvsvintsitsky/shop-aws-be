export interface Logger {
	log(event: Record<string, unknown>): void;
}
