---
title: "AgentEvent"
description: "AgentEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                                                                                                                                                                                                                                             | Presence          | Meaning                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"phase" \| "summary" \| "warning" \| "text" \| "text-delta" \| "result" \| "prompt" \| "tool" \| "tool-result" \| "step" \| "tool-denied" \| "stop-prevented" \| "compaction" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Required          | Discriminator selecting the event payload: phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished or raw. |
| `name`       | `string`                                                                                                                                                                                                                                         | Variant-dependent | Phase name for phase events, or tool name for tool and tool-result events.                                                                                                                                             |
| `agent`      | `string \| undefined`                                                                                                                                                                                                                            | Variant-dependent | Agent CLI identifier to report or diagnose: claude, codex or gemini.                                                                                                                                                   |
| `branch`     | `string \| undefined`                                                                                                                                                                                                                            | Variant-dependent | Name of the work branch used or observed during execution.                                                                                                                                                             |
| `directory`  | `string \| undefined`                                                                                                                                                                                                                            | Variant-dependent | Host workspace directory used for this execution.                                                                                                                                                                      |
| `durationMs` | `number`                                                                                                                                                                                                                                         | Variant-dependent | Elapsed execution time in milliseconds.                                                                                                                                                                                |
| `status`     | `number`                                                                                                                                                                                                                                         | Variant-dependent | Process exit code; zero denotes success.                                                                                                                                                                               |
| `tokens`     | `Usage`                                                                                                                                                                                                                                          | Variant-dependent | Token usage counters carried by a usage or summary event.                                                                                                                                                              |
| `message`    | `string`                                                                                                                                                                                                                                         | Variant-dependent | Warning or failure message, or the message a stop hook sent back to the model.                                                                                                                                         |
| `text`       | `string`                                                                                                                                                                                                                                         | Variant-dependent | Text carried by the event: a streamed fragment, streamed text, final answer or submitted prompt according to kind.                                                                                                     |
| `input`      | `unknown`                                                                                                                                                                                                                                        | Variant-dependent | Raw arguments supplied to the tool named by this tool event.                                                                                                                                                           |
| `callId`     | `string \| undefined \| string \| string`                                                                                                                                                                                                        | Variant-dependent | Identifier linking a tool event to its tool-result event; set by custom harnesses.                                                                                                                                     |
| `isError`    | `boolean`                                                                                                                                                                                                                                        | Variant-dependent | Whether the tool call failed or reported an error.                                                                                                                                                                     |
| `preview`    | `string`                                                                                                                                                                                                                                         | Variant-dependent | Beginning of the tool result, bounded for logs and reporters.                                                                                                                                                          |
| `characters` | `number`                                                                                                                                                                                                                                         | Variant-dependent | Full length of the tool result before any truncation.                                                                                                                                                                  |
| `index`      | `number`                                                                                                                                                                                                                                         | Variant-dependent | One-based step number of a custom harness turn.                                                                                                                                                                        |
| `reason`     | `string`                                                                                                                                                                                                                                         | Variant-dependent | Why a custom harness denied a tool call.                                                                                                                                                                               |
| `strategy`   | `string`                                                                                                                                                                                                                                         | Variant-dependent | Name of the context strategy that rewrote the history.                                                                                                                                                                 |
| `messages`   | `number`                                                                                                                                                                                                                                         | Variant-dependent | Number of messages in the history after compaction.                                                                                                                                                                    |
| `id`         | `string`                                                                                                                                                                                                                                         | Variant-dependent | Native conversation identifier used to locate or continue the session.                                                                                                                                                 |
| `value`      | `unknown`                                                                                                                                                                                                                                        | Variant-dependent | Unrecognized raw protocol value preserved for observation.                                                                                                                                                             |

## Signature

```ts
export type AgentEvent =
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
    }
  | {
      readonly kind: "tool-result";
      readonly callId: string;
      readonly name: string;
      readonly isError: boolean;
      readonly preview: string;
      readonly characters: number;
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
    };
```

## Related contracts

- [Usage](../usage/)
