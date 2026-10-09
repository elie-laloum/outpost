---
title: "FileWorkspaceRecoveryAuthorization"
description: "FileWorkspaceRecoveryAuthorization — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecoveryAuthorization } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                   | Presence | Meaning                                                                                                       |
| ----------------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `expectedRevision`      | `string`               | Required | Revision obtained by inspection; recovery refuses a changed persisted record.                                 |
| `processesStopped`      | `true`                 | Required | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry. |
| `allocationReleased`    | `true \| undefined`    | Optional | Explicit evidence that an uncertain allocation has been released when the provider cannot recover it.         |
| `adoptInterruptedFiles` | `boolean \| undefined` | Optional | Explicitly adopt retained files from an interrupted attempt after stopping its processes.                     |
| `adoptMountedSource`    | `boolean \| undefined` | Optional | Explicitly adopt a changed mounted source after inspection; never converts the mount into a copy.             |

## Signature

```ts
export interface FileWorkspaceRecoveryAuthorization {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly allocationReleased?: true;
  readonly adoptInterruptedFiles?: boolean;
  readonly adoptMountedSource?: boolean;
}
```
