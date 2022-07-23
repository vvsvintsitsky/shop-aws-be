import { Logger } from "./types";
import { ConsoleLogger } from "./ConsoleLogger";

let logger: Logger;

export function getLogger() {
	if (!logger) {
		logger = new ConsoleLogger();
	}

	return logger;
}
