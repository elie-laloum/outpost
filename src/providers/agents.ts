import { invariant } from "../domain/errors.ts";
import type {
  AgentAdapter,
  AgentEvent,
  AgentInput,
  Variables,
} from "../domain/ports.ts";

interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
export interface ClaudeSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh" | "max";
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
export interface CodexSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh";
  readonly approvalReviewer?: "user" | "auto_review";
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
function number(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
function decode(line: string): Record<string, unknown> | undefined {
  try {
    return record(JSON.parse(line));
  } catch {
    return undefined;
  }
}
function session(input: AgentInput): void {
  if (input.continuation)
    invariant(
      /^[A-Za-z0-9_-]+$/.test(input.continuation.id),
      "Invalid conversation identifier",
    );
}

export function claude(settings: ClaudeSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "claude",
    conversations: "claude",
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request(input: AgentInput) {
      session(input);
      const args: string[] = [];
      if (!input.interactive)
        args.push("--print", "--verbose", "--output-format", "stream-json");
      if (settings.model) args.push("--model", settings.model);
      if (settings.reasoning) args.push("--effort", settings.reasoning);
      if (settings.permissions)
        args.push("--permission-mode", settings.permissions);
      else if (!input.interactive) args.push("--dangerously-skip-permissions");
      if (input.continuation) {
        args.push("--resume", input.continuation.id);
        if (input.continuation.fork) args.push("--fork-session");
      }
      if (input.interactive && input.text !== undefined)
        args.push("--", input.text);
      return {
        executable: "claude",
        arguments: args,
        ...(input.interactive
          ? { interactive: true }
          : { stdin: input.text ?? "" }),
      };
    },
    events(line: string): AgentEvent[] {
      const event = decode(line);
      if (!event) return [{ kind: "raw", value: line }];
      const events: AgentEvent[] = [];
      if (event.type === "system" && typeof event.session_id === "string")
        events.push({ kind: "conversation", id: event.session_id });
      const message = record(event.message);
      if (event.type === "assistant" && Array.isArray(message.content))
        for (const part of message.content) {
          const block = record(part);
          if (block.type === "text" && typeof block.text === "string")
            events.push({ kind: "text", text: block.text });
          if (block.type === "tool_use")
            events.push({
              kind: "tool",
              name: String(block.name),
              input: block.input,
            });
        }
      if (event.type === "result") {
        const usage = record(event.usage);
        if (event.usage)
          events.push({
            kind: "usage",
            tokens: {
              input:
                number(usage.input_tokens) +
                number(usage.cache_creation_input_tokens) +
                number(usage.cache_read_input_tokens),
              cached: number(usage.cache_read_input_tokens),
              output: number(usage.output_tokens),
            },
          });
        events.push(
          event.is_error
            ? {
                kind: "failure",
                message: String(
                  event.result ??
                    JSON.stringify(event.errors) ??
                    "Agent failed",
                ),
              }
            : { kind: "finished" },
        );
      }
      return events.length ? events : [{ kind: "raw", value: event }];
    },
  });
}

export function codex(settings: CodexSettings = {}): AgentAdapter {
  return Object.freeze({
    name: "codex",
    conversations: "codex",
    capture: settings.saveConversations ?? true,
    variables: Object.freeze({ ...settings.variables }),
    request(input: AgentInput) {
      session(input);
      const args: string[] = [];
      if (settings.approvalReviewer === "auto_review")
        args.push(
          "-a",
          "on-request",
          "-s",
          "danger-full-access",
          "-c",
          'approvals_reviewer="auto_review"',
        );
      else if (!input.interactive)
        args.push("--dangerously-bypass-approvals-and-sandbox");
      if (settings.model) args.push("--model", settings.model);
      if (settings.reasoning)
        args.push("-c", `model_reasoning_effort="${settings.reasoning}"`);
      if (!input.interactive) args.push("exec");
      if (input.continuation)
        args.push(
          input.continuation.fork ? "fork" : "resume",
          input.continuation.id,
        );
      if (!input.interactive) args.push("--json", "-");
      else if (input.text !== undefined) args.push("--", input.text);
      return {
        executable: "codex",
        arguments: args,
        ...(input.interactive
          ? { interactive: true }
          : { stdin: input.text ?? "" }),
      };
    },
    events(line: string): AgentEvent[] {
      const event = decode(line);
      if (!event) return [{ kind: "raw", value: line }];
      if (
        event.type === "thread.started" &&
        typeof event.thread_id === "string"
      )
        return [{ kind: "conversation", id: event.thread_id }];
      const item = record(event.item);
      if (
        event.type === "item.completed" &&
        item.type === "agent_message" &&
        typeof item.text === "string"
      )
        return [{ kind: "text", text: item.text }];
      if (event.type === "item.started" && item.type === "command_execution")
        return [{ kind: "tool", name: "command", input: item.command }];
      if (event.type === "item.started" && item.type === "mcp_tool_call")
        return [
          { kind: "tool", name: String(item.tool), input: item.arguments },
        ];
      if (event.type === "turn.completed") {
        const usage = record(event.usage);
        return [
          {
            kind: "usage",
            tokens: {
              input: number(usage.input_tokens),
              cached: number(usage.cached_input_tokens),
              output: number(usage.output_tokens),
            },
          },
          { kind: "finished" },
        ];
      }
      if (event.type === "error" || event.type === "turn.failed")
        return [
          {
            kind: "failure",
            message: String(
              event.message ?? record(event.error).message ?? "Agent failed",
            ),
          },
        ];
      return [{ kind: "raw", value: event }];
    },
  });
}
