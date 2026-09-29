import type { AgentLiveInput } from "../../domain/agent.types.ts";
import { decodeRecord } from "./protocol.ts";

/** Encodes one Claude Code stream-json user message. */
export function claudeUserMessage(text: string): string {
  return `${JSON.stringify({
    type: "user",
    message: { role: "user", content: [{ type: "text", text }] },
    parent_tool_use_id: null,
  })}\n`;
}

/** Claude Code stream-json input acknowledged by --replay-user-messages. */
export const claudeLiveInput: AgentLiveInput = Object.freeze({
  open: () => ({
    encode: claudeUserMessage,
    read(line: string) {
      const event = decodeRecord(line);
      const replayed = event?.type === "user" && event.isReplay === true;
      return { consumed: replayed ? 1 : 0, replies: [] };
    },
  }),
});
