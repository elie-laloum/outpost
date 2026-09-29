---
title: "ResourceActivityRecord"
description: "ResourceActivityRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceActivityRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                                                 | Presence | Meaning                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `1`                                                                                  | Required | Version of this serialized record format; currently 1.                                                                                                                                                          |
| `id`              | `string`                                                                             | Required | Random UUID of the record, stored at resources/&lt;id>.json.                                                                                                                                                    |
| `pid`             | `number`                                                                             | Required | PID of the Outpost process that provisioned the sandbox, not of a process inside it.                                                                                                                            |
| `identity`        | `LocalProcessIdentity \| undefined`                                                  | Optional | Host, boot, PID namespace and start time of the writing process, used to tell a live owner from a reused PID. Absent when written outside Linux; ownership is then unknown.                                     |
| `sandboxProvider` | `string`                                                                             | Required | Name of the sandbox provider that allocated the sandbox, such as docker or vercel.                                                                                                                              |
| `placement`       | `"mounted" \| "remote" \| "host"`                                                    | Required | How the sandbox reaches the workspace: mounted (host worktree mounted, Docker or Podman), remote (copy synchronized with the host: Vercel, Daytona, Firecracker, isolated containers) or host (local provider). |
| `workspace`       | `string`                                                                             | Required | Host path of the worktree the sandbox works on. Recovery retention never prunes a workspace named by a record.                                                                                                  |
| `createdAt`       | `string`                                                                             | Required | ISO time the sandbox was registered, before the provider acquired it.                                                                                                                                           |
| `updatedAt`       | `string`                                                                             | Required | ISO time of the last phase or operation change.                                                                                                                                                                 |
| `phase`           | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Required | Last recorded lifecycle phase: allocating, ready, closing, cleanup-failed or allocation-uncertain.                                                                                                              |
| `operations`      | `readonly ResourceOperation[]`                                                       | Required | Operations running when the record was written, one entry per kind with its concurrent count. Empty when the sandbox is idle.                                                                                   |
| `lastOperation`   | `ResourceOperationResult \| undefined`                                               | Optional | Most recently finished operation, completed or failed.                                                                                                                                                          |
| `lastFailure`     | `ResourceOperationResult \| undefined`                                               | Optional | Most recent operation recorded as failed, retained after subsequent successes.                                                                                                                                  |

## Signature

```ts
export interface ResourceActivityRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: LocalProcessIdentity;
  readonly sandboxProvider: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly workspace: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: ResourcePhase;
  readonly operations: readonly ResourceOperation[];
  readonly lastOperation?: ResourceOperationResult;
  readonly lastFailure?: ResourceOperationResult;
}
```

## Related contracts

- [LocalProcessIdentity](../support-localprocessidentity/)
- [ResourceOperation](../resourceoperation/)
- [ResourceOperationResult](../resourceoperationresult/)
- [ResourcePhase](../resourcephase/)
