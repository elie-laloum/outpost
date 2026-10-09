---
title: "recoverWorkspacePublication"
description: "recoverWorkspacePublication — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkspacePublication } from "@elie-laloum/outpost";
```

## Purpose and behavior

Explicitly finishes or rolls back an inspected publication, fencing stale writers and preserving concurrent changes. It never replays completed tasks.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                       | Type                                      | Presence | Meaning                                                                                                       |
| -------------------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `transporter`              | `Transport`                               | Required | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.                    |
| `reference`                | `TransportReference`                      | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers.       |
| `action`                   | `"finish" \| "rollback"`                  | Required | Explicit finish or rollback request; both verify current preconditions and never execute workflow tasks.      |
| `options`                  | `PublicationRecoveryOptions \| undefined` | Optional | Options selecting source, execution capabilities or inspected recovery preconditions for this operation.      |
| `options.processesStopped` | `true \| undefined`                       | Optional | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry. |

## Returns

`Promise<TransportReference>`

## Signature

```ts
export declare function recoverWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
  action: "finish" | "rollback",
  options?: PublicationRecoveryOptions,
): Promise<TransportReference>;
```

## Related contracts

- [PublicationRecoveryOptions](../publicationrecoveryoptions/)
- [Transport](../transport/)
- [TransportReference](../transportreference/)
