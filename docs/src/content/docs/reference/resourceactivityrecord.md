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

| Name              | Type                                                                                 | Presence | Meaning                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `version`         | `1`                                                                                  | Required | Version of this serialized record format; currently 1.                                                |
| `id`              | `string`                                                                             | Required | Local identity of the sandbox activity record.                                                        |
| `pid`             | `number`                                                                             | Required | Host process ID that owns the recorded sandbox activity.                                              |
| `identity`        | `LocalProcessIdentity \| undefined`                                                  | Optional | Host, boot and process-start identity used to assess ownership beyond a PID alone.                    |
| `sandboxProvider` | `string`                                                                             | Required | Name of the provider owning the recorded sandbox.                                                     |
| `placement`       | `"mounted" \| "remote" \| "host"`                                                    | Required | Workspace access model: mounted host checkout, synchronized remote checkout or direct host execution. |
| `workspace`       | `string`                                                                             | Required | Host path of the workspace associated with the recorded sandbox.                                      |
| `createdAt`       | `string`                                                                             | Required | ISO timestamp when the local resource activity record was created.                                    |
| `updatedAt`       | `string`                                                                             | Required | ISO timestamp when the local resource activity record was last updated.                               |
| `phase`           | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Required | Last locally recorded sandbox lifecycle phase.                                                        |
| `operations`      | `readonly ResourceOperation[]`                                                       | Required | Operations currently recorded as active for this sandbox.                                             |
| `lastOperation`   | `ResourceOperationResult \| undefined`                                               | Optional | Most recently completed local operation with its outcome and timestamps.                              |
| `lastFailure`     | `ResourceOperationResult \| undefined`                                               | Optional | Most recent operation recorded as failed, retained after subsequent successes.                        |

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
