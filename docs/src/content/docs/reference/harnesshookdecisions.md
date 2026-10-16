---
title: "HarnessHookDecisions"
description: "HarnessHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                                                      | Presence | Meaning                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-start`     | `{ readonly instructions: string; }`                                                                                      | Required | Return { instructions } to append text to the system instructions of the turn.                                                                                                                           |
| `before-prompt`     | `{ readonly prompt: string; } \| { readonly deny: string; }`                                                              | Required | Only the explicit before-prompt transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                            |
| `before-model`      | `{ readonly messages?: readonly ModelMessage[]; readonly system?: string; }`                                              | Required | Replace messages or system instructions for this request. Message validation preserves replayable reasoning; typed response instructions remain final.                                                   |
| `after-model`       | `{ readonly result: Pick<ModelResult, "text" \| "content"> & { readonly usage?: never; readonly stopReason?: never; }; }` | Required | Replace text and optionally content passed to the loop. Original usage, refusals and output limits remain effective; injected tool calls still require permissions.                                      |
| `model-error`       | `never`                                                                                                                   | Required | Only the explicit model-error transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                              |
| `before-compaction` | `{ readonly messages: readonly ModelMessage[]; }`                                                                         | Required | Only the explicit before-compaction transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                        |
| `after-compaction`  | `{ readonly messages: readonly ModelMessage[]; }`                                                                         | Required | Only the explicit after-compaction transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                         |
| `before-subagent`   | `{ readonly prompt: string; } \| { readonly deny: string; }`                                                              | Required | Only the explicit before-subagent transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                          |
| `after-subagent`    | `{ readonly text: string; }`                                                                                              | Required | Only the explicit after-subagent transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                           |
| `run-end`           | `never`                                                                                                                   | Required | Only the explicit run-end transformation shown in this type is accepted. never forbids a decision; throwing fails execution except while reporting an existing failure.                                  |
| `before-tool`       | `{ readonly deny: string; } \| { readonly input: unknown; }`                                                              | Required | Return { deny } with a nonempty reason to refuse the call and skip later hooks, or { input } to pass a replacement to the next hook. The final input is validated and checked against permissions again. |
| `after-tool`        | `{ readonly result: ToolOutput; }`                                                                                        | Required | Return { result } with text or { content, isError } to replace what the model receives; later hooks see the replacement.                                                                                 |
| `stop`              | `{ readonly continue: string; }`                                                                                          | Required | Return { continue } with a nonempty message to refuse the final answer; the message becomes the next user message and later stop hooks are skipped. Bounded by maxSteps.                                 |

## Signature

```ts
export interface HarnessHookDecisions {
  readonly "session-start": {
    readonly instructions: string;
  };
  readonly "before-prompt":
    | {
        readonly prompt: string;
      }
    | {
        readonly deny: string;
      };
  readonly "before-model": {
    readonly messages?: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": {
    readonly result: Pick<ModelResult, "text" | "content"> & {
      readonly usage?: never;
      readonly stopReason?: never;
    };
  };
  readonly "model-error": never;
  readonly "before-compaction": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "after-compaction": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "before-subagent":
    | {
        readonly prompt: string;
      }
    | {
        readonly deny: string;
      };
  readonly "after-subagent": {
    readonly text: string;
  };
  readonly "run-end": never;
  readonly "before-tool":
    | {
        readonly deny: string;
      }
    | {
        readonly input: unknown;
      };
  readonly "after-tool": {
    readonly result: ToolOutput;
  };
  readonly stop: {
    readonly continue: string;
  };
}
```

## Related contracts

- [ModelMessage](../modelmessage/)
- [ModelResult](../modelresult/)
- [ToolOutput](../tooloutput/)
