import { ServerWebSocket } from "bun";

export const sessionManager = new Map<string, ServerWebSocket<unknown>>();
