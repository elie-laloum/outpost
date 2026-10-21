---
title: "HarnessHookEvents"
description: "HarnessHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookEvents } from "@elie-laloum/outpost/harness";
```

## Parameters and properties

| Name                | Type                                                                                                                                                         | Presence | Meaning                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------- |
| `session-start`     | `{ readonly prompt: string; readonly source?: "start" \| "resume" \| "repair"; }`                                                                            | Required | Event for session-start hooks: the rendered prompt.                                           |
| `before-prompt`     | `{ readonly prompt: string; readonly source: "initial" \| "steering"; }`                                                                                     | Required | Context supplied at before-prompt; values are copied and frozen before callback delivery.     |
| `before-model`      | `{ readonly messages: readonly ModelMessage[]; readonly system?: string; }`                                                                                  | Required | Event for before-model hooks: the messages about to be sent.                                  |
| `after-model`       | `{ readonly result: ModelResult; }`                                                                                                                          | Required | Event for after-model hooks: the model result.                                                |
| `model-error`       | `{ readonly error: unknown; }`                                                                                                                               | Required | Context supplied at model-error; values are copied and frozen before callback delivery.       |
| `before-compaction` | `{ readonly messages: readonly ModelMessage[]; readonly strategy: string; }`                                                                                 | Required | Context supplied at before-compaction; values are copied and frozen before callback delivery. |
| `after-compaction`  | `{ readonly messages: readonly ModelMessage[]; readonly strategy: string; }`                                                                                 | Required | Context supplied at after-compaction; values are copied and frozen before callback delivery.  |
| `before-subagent`   | `{ readonly id: string; readonly name: string; readonly callId: string; readonly prompt: string; }`                                                          | Required | Context supplied at before-subagent; values are copied and frozen before callback delivery.   |
| `after-subagent`    | `{ readonly id: string; readonly name: string; readonly callId: string; readonly text?: string; readonly error?: unknown; readonly conversation?: string; }` | Required | Context supplied at after-subagent; values are copied and frozen before callback delivery.    |
| `run-end`           | `{ readonly reason: "success" \| "error" \| "aborted" \| "timeout" \| "limit"; readonly text?: string; readonly error?: unknown; }`                          | Required | Context supplied at run-end; values are copied and frozen before callback delivery.           |
| `before-tool`       | `{ readonly call: ModelToolCallBlock; }`                                                                                                                     | Required | Event for before-tool hooks: the validated call.                                              |
| `after-tool`        | `{ readonly call: ModelToolCallBlock; readonly result: HarnessToolResultView; readonly status?: "success" \| "denied" \| "error"; }`                         | Required | Event for after-tool hooks: the call and its outcome.                                         |
| `stop`              | `{ readonly text: string; }`                                                                                                                                 | Required | Event for stop hooks: the final answer text.                                                  |

## Signature

```ts
export interface HarnessHookEvents {
  readonly "session-start": {
    readonly prompt: string;
    readonly source?: "start" | "resume" | "repair";
  };
  readonly "before-prompt": {
    readonly prompt: string;
    readonly source: "initial" | "steering";
  };
  readonly "before-model": {
    readonly messages: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": {
    readonly result: ModelResult;
  };
  readonly "model-error": {
    readonly error: unknown;
  };
  readonly "before-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "after-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "before-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly prompt: string;
  };
  readonly "after-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly text?: string;
    readonly error?: unknown;
    readonly conversation?: string;
  };
  readonly "run-end": {
    readonly reason: "success" | "error" | "aborted" | "timeout" | "limit";
    readonly text?: string;
    readonly error?: unknown;
  };
  readonly "before-tool": {
    readonly call: ModelToolCallBlock;
  };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
    readonly status?: "success" | "denied" | "error";
  };
  readonly stop: {
    readonly text: string;
  };
}
```

## Related contracts

- [HarnessToolResultView](../harnesstoolresultview/)
- [ModelMessage](../modelmessage/)
- [ModelResult](../modelresult/)
- [ModelToolCallBlock](../modeltoolcallblock/)
