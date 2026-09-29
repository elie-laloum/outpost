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

| Name            | Type                                                         | Presence | Meaning                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-start` | `{ readonly instructions: string; }`                         | Required | Return { instructions } to append text to the system instructions of the turn.                                                                                                                           |
| `before-model`  | `never`                                                      | Required | No decision: any return value is ignored; throw to fail the turn.                                                                                                                                        |
| `after-model`   | `never`                                                      | Required | No decision: any return value is ignored; throw to fail the turn.                                                                                                                                        |
| `before-tool`   | `{ readonly deny: string; } \| { readonly input: unknown; }` | Required | Return { deny } with a nonempty reason to refuse the call and skip later hooks, or { input } to pass a replacement to the next hook. The final input is validated and checked against permissions again. |
| `after-tool`    | `{ readonly result: ToolOutput; }`                           | Required | Return { result } with text or { content, isError } to replace what the model receives; later hooks see the replacement.                                                                                 |
| `stop`          | `{ readonly continue: string; }`                             | Required | Return { continue } with a nonempty message to refuse the final answer; the message becomes the next user message and later stop hooks are skipped. Bounded by maxSteps.                                 |

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
