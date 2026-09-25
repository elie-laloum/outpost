---
title: "ResourceActivityRecord"
description: "ResourceActivityRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceActivityRecord**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceActivityRecord } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name            | Type                                                                                 | Presence | Meaning                                                                 |
| --------------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `version`       | `1`                                                                                  | Required | Caller-controlled contract or graph version.                            |
| `id`            | `string`                                                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `pid`           | `number`                                                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `identity`      | `LocalProcessIdentity \| undefined`                                                  | Optional | See the linked contract and this family's rules for its interpretation. |
| `provider`      | `string`                                                                             | Required | Execution environment backend.                                          |
| `placement`     | `"mounted" \| "remote" \| "host"`                                                    | Required | See the linked contract and this family's rules for its interpretation. |
| `workspace`     | `string`                                                                             | Required | Caller-owned Git workspace; excludes new repository/branch choices.     |
| `createdAt`     | `string`                                                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `updatedAt`     | `string`                                                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `phase`         | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Required | See the linked contract and this family's rules for its interpretation. |
| `operations`    | `readonly ResourceOperation[]`                                                       | Required | See the linked contract and this family's rules for its interpretation. |
| `lastOperation` | `ResourceOperationResult \| undefined`                                               | Optional | See the linked contract and this family's rules for its interpretation. |
| `lastFailure`   | `ResourceOperationResult \| undefined`                                               | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ResourceActivityRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: LocalProcessIdentity;
  readonly provider: string;
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
