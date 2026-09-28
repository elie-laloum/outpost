---
title: "AgentEventDetails"
description: "AgentEventDetails — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name           | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Presence          | Meaning                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`         | `"subagent" \| "message-usage" \| "stderr" \| "stopped" \| "reasoning" \| "file-change" \| "model-request" \| "model-response" \| "model-retry" \| "model-error" \| "hook" \| "instructions-loaded" \| "skills-loaded" \| "tool-output" \| "phase" \| "summary" \| "warning" \| "text" \| "text-delta" \| "result" \| "prompt" \| "tool" \| "tool-result" \| "step" \| "tool-denied" \| "stop-prevented" \| "compaction" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Required          | Discriminator selecting the event payload: phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished or raw. |
| `id`           | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Conversation identifier for conversation events, or unique child execution identifier for subagent lifecycle events.                                                                                                   |
| `callId`       | `string \| string \| undefined \| string \| string \| undefined \| string \| string`                                                                                                                                                                                                                                                                                                                                                                                                       | Variant-dependent | Identifier linking a tool event to its tool-result event; set by custom harnesses.                                                                                                                                     |
| `name`         | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Phase name for phase events, or tool name for tool and tool-result events.                                                                                                                                             |
| `status`       | `"started" \| "finished" \| "failed" \| number`                                                                                                                                                                                                                                                                                                                                                                                                                                            | Variant-dependent | Process exit status for summaries, or started, finished or failed for a child lifecycle event.                                                                                                                         |
| `conversation` | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Persisted child conversation identifier when the child enables transcript storage.                                                                                                                                     |
| `tokens`       | `Usage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Variant-dependent | Token usage counters carried by a usage or summary event.                                                                                                                                                              |
| `messageId`    | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | CLI identifier of the message whose usage is reported.                                                                                                                                                                 |
| `parentCallId` | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Parent tool call supplied by a CLI for a nested agent message or tool event.                                                                                                                                           |
| `text`         | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Text carried by the event: a streamed fragment, streamed text, final answer or submitted prompt according to kind.                                                                                                     |
| `truncated`    | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Variant-dependent | Whether the stderr fragment or oversized raw preview was bounded before delivery.                                                                                                                                      |
| `reason`       | `"completion" \| "idle-timeout" \| "deadline" \| "aborted" \| "oversized-event" \| string`                                                                                                                                                                                                                                                                                                                                                                                                 | Variant-dependent | Reason for tool denial or forced termination; stopped distinguishes completion, idle timeout, deadline, cancellation and oversized protocol output.                                                                    |
| `changes`      | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Structured file changes exposed by the CLI; the adapter preserves the supplied protocol data.                                                                                                                          |
| `request`      | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Model request observed only when the hub explicitly enables verbose payloads; may contain private instructions and messages.                                                                                           |
| `response`     | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Model response observed only when verbose payloads are enabled, including tool calls and replayable content.                                                                                                           |
| `attempt`      | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Retry attempt explicitly reported by a model provider; Outpost does not infer hidden retries.                                                                                                                          |
| `message`      | `string \| undefined \| string \| string \| string \| string`                                                                                                                                                                                                                                                                                                                                                                                                                              | Variant-dependent | Warning or failure message, or the message a stop hook sent back to the model.                                                                                                                                         |
| `phase`        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Harness hook phase that completed.                                                                                                                                                                                     |
| `changed`      | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Whether a hook returned a decision or changed its observable input.                                                                                                                                                    |
| `count`        | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Number of nonempty instruction sources resolved for this harness turn.                                                                                                                                                 |
| `names`        | `readonly string[]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Variant-dependent | Skills newly loaded into the conversation and available to subsequent model steps.                                                                                                                                     |
| `channel`      | `"stdout" \| "stderr"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Variant-dependent | Command output stream for the tool-output event: stdout or stderr.                                                                                                                                                     |
| `agent`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Agent CLI identifier to report or diagnose: claude, codex, antigravity (executable agy), copilot or kimi.                                                                                                              |
| `branch`       | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Name of the work branch used or observed during execution.                                                                                                                                                             |
| `directory`    | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Host workspace directory used for this execution.                                                                                                                                                                      |
| `durationMs`   | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Elapsed execution time in milliseconds.                                                                                                                                                                                |
| `input`        | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Raw arguments supplied to the tool named by this tool event.                                                                                                                                                           |
| `isError`      | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Whether the tool call failed or reported an error.                                                                                                                                                                     |
| `preview`      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Beginning of the tool result, bounded for logs and reporters.                                                                                                                                                          |
| `characters`   | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Full length of the tool result before any truncation.                                                                                                                                                                  |
| `index`        | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | One-based step number of a custom harness turn.                                                                                                                                                                        |
| `strategy`     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Name of the context strategy that rewrote the history.                                                                                                                                                                 |
| `messages`     | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Variant-dependent | Number of messages in the history after compaction.                                                                                                                                                                    |
| `cumulative`   | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Variant-dependent | On CLI usage events, true identifies a total for the current command. The runtime converts it to nonnegative deltas before notifying observers; omission means an incremental usage event.                             |
| `value`        | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Variant-dependent | Unrecognized raw protocol value preserved for observation.                                                                                                                                                             |
| `bytes`        | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Variant-dependent | Observed UTF-8 byte size of an oversized protocol line or buffered prefix before termination.                                                                                                                          |

## Signature

```ts
export type AgentEventDetails =
  | {
      readonly kind: "subagent";
      readonly id: string;
      readonly callId: string;
      readonly name: string;
      readonly status: "started" | "finished" | "failed";
      readonly conversation?: string;
    }
  | {
      readonly kind: "message-usage";
      readonly tokens: Usage;
      readonly messageId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "stderr";
      readonly text: string;
      readonly truncated?: boolean;
    }
  | {
      readonly kind: "stopped";
      readonly reason:
        | "completion"
        | "idle-timeout"
        | "deadline"
        | "aborted"
        | "oversized-event";
    }
  | {
      readonly kind: "reasoning";
      readonly text: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "file-change";
      readonly changes: unknown;
      readonly callId?: string;
    }
  | {
      readonly kind: "model-request";
      readonly request: unknown;
    }
  | {
      readonly kind: "model-response";
      readonly response: unknown;
    }
  | {
      readonly kind: "model-retry";
      readonly attempt: number;
      readonly message?: string;
    }
  | {
      readonly kind: "model-error";
      readonly message: string;
    }
  | {
      readonly kind: "hook";
      readonly phase: string;
      readonly changed: boolean;
    }
  | {
      readonly kind: "instructions-loaded";
      readonly count: number;
    }
  | {
      readonly kind: "skills-loaded";
      readonly names: readonly string[];
    }
  | {
      readonly kind: "tool-output";
      readonly callId: string;
      readonly channel: "stdout" | "stderr";
      readonly text: string;
    }
  | {
      readonly kind: "phase";
      readonly name: string;
      readonly agent?: string;
      readonly branch?: string;
      readonly directory?: string;
    }
  | {
      readonly kind: "summary";
      readonly durationMs: number;
      readonly status: number;
      readonly tokens: Usage;
    }
  | {
      readonly kind: "warning";
      readonly message: string;
    }
  | {
      readonly kind: "text";
      readonly text: string;
    }
  | {
      readonly kind: "text-delta";
      readonly text: string;
    }
  | {
      readonly kind: "result";
      readonly text: string;
    }
  | {
      readonly kind: "prompt";
      readonly text: string;
    }
  | {
      readonly kind: "tool";
      readonly name: string;
      readonly input: unknown;
      readonly callId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "tool-result";
      readonly callId: string;
      readonly name: string;
      readonly isError: boolean;
      readonly preview: string;
      readonly characters: number;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "step";
      readonly index: number;
    }
  | {
      readonly kind: "tool-denied";
      readonly callId: string;
      readonly name: string;
      readonly reason: string;
    }
  | {
      readonly kind: "stop-prevented";
      readonly message: string;
    }
  | {
      readonly kind: "compaction";
      readonly strategy: string;
      readonly messages: number;
    }
  | {
      readonly kind: "conversation";
      readonly id: string;
    }
  | {
      readonly kind: "usage";
      readonly tokens: Usage;
      readonly cumulative?: boolean;
    }
  | {
      readonly kind: "failure";
      readonly message: string;
    }
  | {
      readonly kind: "finished";
    }
  | {
      readonly kind: "raw";
      readonly value: unknown;
      readonly bytes?: number;
      readonly truncated?: boolean;
    };
```

## Related contracts

- [Usage](../usage/)
