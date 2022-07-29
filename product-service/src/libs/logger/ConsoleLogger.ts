import { Logger } from "./types";

export class ConsoleLogger implements Logger {
    private parseEventToLogString(event: Record<string, unknown>) {
        return "EVENT\n" + JSON.stringify(event, null, 2)
    }

    public log(event: Record<string, unknown>) {
        console.log(this.parseEventToLogString(event))
    }
}