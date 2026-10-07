---
title: "ConflictResolver"
description: "ConflictResolver — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ConflictResolver } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type              | Presence | Meaning                                                                                                                                                          |
| --------- | ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context` | `ConflictContext` | Required | Separate resolution workspace, exact source and host commits, conflicting paths, cancellation signal and inherited observation hub for this integration attempt. |

## Returns

`Promise<ConflictResolution>`

## Signature

```ts
export type ConflictResolver = (
  context: ConflictContext,
) => Promise<ConflictResolution>;
```

## Related contracts

- [ConflictContext](../conflictcontext/)
- [ConflictResolution](../conflictresolution/)
