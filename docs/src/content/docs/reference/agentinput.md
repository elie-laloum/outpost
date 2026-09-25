---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                             | Presence | Meaning                                                                                    |
| -------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `text`         | `string \| undefined`                                            | Optional | Prepared prompt passed to the native agent CLI.                                            |
| `interactive`  | `boolean \| undefined`                                           | Optional | Request an interactive agent invocation or process terminal.                               |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it. |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
