---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **AttachResult**. See the [commands and terminal guide](../../sandboxes/commands/) for behavior, defaults and examples.

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}
```

## Related contracts

- [CommandResult](../commandresult/)
- [Commit](../commit/)
- [Disposal](../disposal/)
