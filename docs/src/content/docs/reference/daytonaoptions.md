---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **DaytonaOptions**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name         | Type                                                                           | Presence | Meaning                                                                 |
| ------------ | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optional | See the linked contract and this family's rules for its interpretation. |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optional | Explicit environment declarations; values are strings.                  |
| `root`       | `string \| undefined`                                                          | Optional | See the linked contract and this family's rules for its interpretation. |
| `retain`     | `number \| undefined`                                                          | Optional | Maximum retained tail per output stream, in bytes.                      |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Related contracts

- [Variables](../variables/)
