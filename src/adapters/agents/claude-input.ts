import type { AgentLiveInput } from "../../domain/agent.types.ts";
import { decodeRecord } from "./protocol.ts";

/** Claude Code stream-json input acknowledged by --replay-user-messages. */
export const claudeLiveInput: AgentLiveInput = Object.freeze({
  encode: (text: string) =>
    `${JSON.stringify({
      type: "user",
      message: { role: "user", content: [{ type: "text", text }] },
      parent_tool_use_id: null,
    })}\n`,
  consumed(line: string): boolean {
    const event = decodeRecord(line);
    return event?.type === "user" && event.isReplay === true;
  },
});
