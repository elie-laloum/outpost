---
title: "HarnessHookDecisions"
description: "HarnessHookDecisions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Persisted conversations, built-in toolsets and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                         | Presence | Meaning                                                                                                                                                          |
| --------------- | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-start` | `{ readonly instructions: string; }`                         | Required | Return { instructions } to append text to the system instructions of the turn.                                                                                   |
| `before-model`  | `never`                                                      | Required | No decision: return nothing to continue, or throw to fail the turn.                                                                                              |
| `after-model`   | `never`                                                      | Required | No decision: return nothing to continue, or throw to fail the turn.                                                                                              |
| `before-tool`   | `{ readonly deny: string; } \| { readonly input: unknown; }` | Required | Return { deny } to refuse the call with a reason sent to the model, or { input } to replace the input, which is validated and checked against permissions again. |
| `after-tool`    | `{ readonly result: ToolOutput; }`                           | Required | Return { result } to replace the text or error flag sent to the model.                                                                                           |
| `stop`          | `{ readonly continue: string; }`                             | Required | Return { continue } with a message to refuse the final answer; the message is sent as the next user message. Bounded by maxSteps.                                |

## Signature

```ts
export interface HarnessHookDecisions {
  readonly "session-start": {
    readonly instructions: string;
  };
  readonly "before-model": never;
  readonly "after-model": never;
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

- [ToolOutput](../tooloutput/)
