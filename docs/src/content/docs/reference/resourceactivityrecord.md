---
title: "ResourceActivityRecord"
description: "ResourceActivityRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **ResourceActivityRecord**. See the [resource activity guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { ResourceActivityRecord } from "@elie-laloum/outpost";
```

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
