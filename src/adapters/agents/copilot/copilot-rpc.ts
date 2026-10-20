import type {
  AgentInput,
  AgentLiveSession,
} from "../../../domain/agent.types.ts";
import type { Bound } from "../settings.types.ts";
import { profileText } from "../profile-support.ts";
import { asRecord, decodeRecord } from "../protocol.ts";
import type { CopilotSettings } from "./copilot.types.ts";
import { copilotRpcInitialId } from "./copilot-rpc.constants.ts";

const line = (value: object) => `${JSON.stringify(value)}\n`;

export function copilotRpcInitialize(
  settings: Bound<CopilotSettings>,
  input: AgentInput,
): string {
  return line({
    jsonrpc: "2.0",
    id: copilotRpcInitialId,
    method: input.continuation ? "session.resume" : "session.create",
    params: {
      ...(input.continuation ? { sessionId: input.continuation.id } : {}),
      ...(settings.model ? { model: settings.model.name } : {}),
      clientName: "outpost",
      requestPermission: true,
      requestUserInput: false,
      excludedTools: ["ask_user"],
      enableConfigDiscovery: true,
      enableFileHooks: true,
      trustWorkingDirectory: "session",
    },
  });
}

export function copilotRpcSession(
  settings: Bound<CopilotSettings>,
  input: AgentInput,
): AgentLiveSession {
  let sessionId: string | undefined;
  let sequence = 0;
  const pending = new Set<string>();
  const messages = new Set<string>();
  const received = new Set<string>();
  const queued: string[] = [];
  const send = (prompt: string) => {
    const id = `outpost-send-${++sequence}`;
    pending.add(id);
    return line({
      jsonrpc: "2.0",
      id,
      method: "session.send",
      params: { sessionId, prompt, mode: "immediate" },
    });
  };
  return {
    encode(text) {
      if (sessionId) return send(text);
      queued.push(text);
      return "";
    },
    read(output) {
      const message = decodeRecord(output);
      if (!message) return { consumed: 0, replies: [] };
      const replies: string[] = [];
      let consumed = 0;
      if (message.method === "session.event") {
        const event = asRecord(asRecord(message.params).event);
        const data = asRecord(event.data);
        if (
          event.type === "permission.requested" &&
          !data.resolvedByHook &&
          typeof data.requestId === "string"
        )
          replies.push(
            line({
              jsonrpc: "2.0",
              id: `outpost-permission-${++sequence}`,
              method: "session.permissions.handlePendingPermissionRequest",
              params: {
                sessionId,
                requestId: data.requestId,
                result: { kind: "approve-once" },
              },
            }),
          );
        if (
          event.type === "user.message" &&
          typeof data.messageId === "string"
        ) {
          if (messages.delete(data.messageId)) consumed++;
          else received.add(data.messageId);
        }
      }
      if (message.method && message.id !== undefined) {
        replies.push(
          line({
            jsonrpc: "2.0",
            id: message.id,
            ...(message.method === "permission.request"
              ? { result: { kind: "approved" } }
              : {
                  error: {
                    code: -32601,
                    message: "Unsupported Copilot client request",
                  },
                }),
          }),
        );
      }
      if (message.id === copilotRpcInitialId && !message.error) {
        const id = asRecord(message.result).sessionId;
        if (typeof id === "string") {
          sessionId = id;
          replies.push(
            send(profileText(settings.profile, input.text) ?? ""),
            ...queued.splice(0).map(send),
          );
        }
      }
      const id = typeof message.id === "string" ? message.id : "";
      if (pending.delete(id) && message.error === undefined) {
        const messageId = asRecord(message.result).messageId;
        if (typeof messageId === "string") {
          if (received.delete(messageId)) consumed++;
          else messages.add(messageId);
        }
      }
      return { consumed, replies };
    },
  };
}
