---
title: "recoverWorkspacePathLock"
description: "recoverWorkspacePathLock — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkspacePathLock } from "@elie-laloum/outpost";
```

## Purpose and behavior

Releases only an explicitly inspected lock after the caller confirms its owner processes have stopped. Never infers authorization from a PID.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                       | Type                           | Presence | Meaning                                                                                                       |
| -------------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                       | `string`                       | Required | Stable identifier of this resource, independent of its materialization path.                                  |
| `expectedDirectory`        | `string`                       | Required | Inspected canonical directory that must match the exact abandoned lock.                                       |
| `options`                  | `WorkspacePathRecoveryOptions` | Required | Options selecting source, execution capabilities or inspected recovery preconditions for this operation.      |
| `options.processesStopped` | `true`                         | Required | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry. |

## Returns

`Promise<void>`

## Signature

```ts
export declare function recoverWorkspacePathLock(
  id: string,
  expectedDirectory: string,
  options: WorkspacePathRecoveryOptions,
): Promise<void>;
```

## Related contracts

- [WorkspacePathRecoveryOptions](../workspacepathrecoveryoptions/)
