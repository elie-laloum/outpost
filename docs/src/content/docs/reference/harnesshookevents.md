---
title: "HarnessHookEvents"
description: "HarnessHookEvents — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessHookEvents } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                             | Presence | Meaning                                                      |
| --------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `session-start` | `{ readonly prompt: string; }`                                                   | Required | Event for session-start hooks: the rendered prompt.          |
| `before-model`  | `{ readonly messages: readonly ModelMessage[]; }`                                | Required | Event for before-model hooks: the messages about to be sent. |
| `after-model`   | `{ readonly result: ModelResult; }`                                              | Required | Event for after-model hooks: the model result.               |
| `before-tool`   | `{ readonly call: ModelToolCallBlock; }`                                         | Required | Event for before-tool hooks: the validated call.             |
| `after-tool`    | `{ readonly call: ModelToolCallBlock; readonly result: HarnessToolResultView; }` | Required | Event for after-tool hooks: the call and its outcome.        |
| `stop`          | `{ readonly text: string; }`                                                     | Required | Event for stop hooks: the final answer text.                 |

## Signature

```ts
export interface HarnessHookEvents {
  readonly "session-start": {
    readonly prompt: string;
  };
  readonly "before-model": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "after-model": {
    readonly result: ModelResult;
  };
  readonly "before-tool": {
    readonly call: ModelToolCallBlock;
  };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
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
