import type {
  AgentInput,
  AgentLiveRead,
  AgentLiveSession,
} from "../../domain/agent.types.ts";
import {
  codexAppClient,
  codexAppRequests,
  codexAppUnsupportedRequest,
} from "./codex-app.constants.ts";
import { asRecord, decodeRecord } from "./protocol.ts";
import type { Bound, CodexSettings } from "./settings.types.ts";

const line = (message: object) => `${JSON.stringify(message)}\n`;
const text = (value: string) => [
  { type: "text", text: value, text_elements: [] },
];
const none: AgentLiveRead = Object.freeze({ consumed: 0, replies: [] });

/** First stdin line of `codex app-server`: the initialize request. */
export function codexAppInitialize(): string {
  return line({
    id: `${codexAppRequests.initialize}-0`,
    method: "initialize",
    params: { clientInfo: codexAppClient, capabilities: null },
  });
}

/** Drives one `codex app-server` turn: thread, turn, then steering by turn/steer. */
export function codexAppSession(
  settings: Bound<CodexSettings>,
  input: AgentInput,
): AgentLiveSession {
  let sequence = 0;
  let thread: string | undefined;
  let turn: string | undefined;
  let accepted = false;
  const queued: string[] = [];
  const steering = new Map<string, string>();
  const request = (prefix: string, method: string, params: object) => {
    const id = `${prefix}-${++sequence}`;
    return { id, data: line({ id, method, params }) };
  };
  const policy = {
    approvalPolicy:
      settings.approvalReviewer === "auto_review" ? "on-request" : "never",
    sandbox: "danger-full-access",
    ...(settings.approvalReviewer === "auto_review"
      ? { approvalsReviewer: "auto_review" }
      : {}),
    ...(settings.model ? { model: settings.model.name } : {}),
  };
  const openThread = () => {
    const continuation = input.continuation;
    if (!continuation)
      return request(codexAppRequests.thread, "thread/start", policy).data;
    return request(
      codexAppRequests.thread,
      continuation.fork ? "thread/fork" : "thread/resume",
      { threadId: continuation.id, ...policy },
    ).data;
  };
  const startTurn = (value: string) =>
    request(codexAppRequests.turn, "turn/start", {
      threadId: thread,
      input: text(value),
      ...(settings.model?.reasoning
        ? { effort: settings.model.reasoning }
        : {}),
    }).data;
  // Without an active turn, an instruction starts the next turn of the thread.
  const steer = (value: string) => {
    if (!turn) return startTurn(value);
    const sent = request(codexAppRequests.steer, "turn/steer", {
      threadId: thread,
      expectedTurnId: turn,
      input: text(value),
    });
    steering.set(sent.id, value);
    return sent.data;
  };
  const responses: Readonly<
    Record<
      string,
      (
        result: Record<string, unknown>,
        failed: boolean,
        id: string,
      ) => AgentLiveRead
    >
  > = {
    [codexAppRequests.initialize]: () => ({
      consumed: 0,
      replies: [line({ method: "initialized" }), openThread()],
    }),
    [codexAppRequests.thread]: (result) => {
      const id = asRecord(result.thread).id;
      thread = typeof id === "string" ? id : undefined;
      return {
        consumed: 0,
        replies: thread ? [startTurn(input.text ?? "")] : [],
      };
    },
    [codexAppRequests.turn]: (result, failed) => {
      if (failed) return none;
      const id = asRecord(result.turn).id;
      if (typeof id === "string") turn = id;
      accepted = true;
      return { consumed: 1, replies: queued.splice(0).map(steer) };
    },
    [codexAppRequests.steer]: (_result, failed, id) => {
      const value = steering.get(id);
      steering.delete(id);
      if (!failed) return { consumed: 1, replies: [] };
      turn = undefined;
      return { consumed: 0, replies: value ? [startTurn(value)] : [] };
    },
  };
  const notifications: Readonly<
    Record<string, (params: Record<string, unknown>) => void>
  > = {
    "turn/started": (params) => {
      const id = asRecord(params.turn).id;
      if (typeof id === "string") turn = id;
    },
    "turn/completed": () => {
      turn = undefined;
    },
  };
  return {
    encode(value) {
      if (!thread || !accepted) {
        queued.push(value);
        return "";
      }
      return steer(value);
    },
    read(output) {
      const message = decodeRecord(output);
      if (!message) return none;
      const method =
        typeof message.method === "string" ? message.method : undefined;
      if (message.id !== undefined && method)
        return {
          consumed: 0,
          replies: [
            line({ id: message.id, error: codexAppUnsupportedRequest }),
          ],
        };
      const id = typeof message.id === "string" ? message.id : undefined;
      if (method) {
        notifications[method]?.(asRecord(message.params));
        return none;
      }
      if (id === undefined) return none;
      const prefix = Object.values(codexAppRequests).find((value) =>
        id.startsWith(`${value}-`),
      );
      const handler = prefix ? responses[prefix] : undefined;
      return (
        handler?.(asRecord(message.result), message.error !== undefined, id) ??
        none
      );
    },
  };
}
