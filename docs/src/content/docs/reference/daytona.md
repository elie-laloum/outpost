---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 10
---

Public contract for **daytona**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                 | Type                                                                                      | Presence | Meaning                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optional | Explicit environment declarations; values are strings.                                   |
| `options.root`       | `string \| undefined`                                                                     | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.retain`     | `number \| undefined`                                                                     | Optional | Maximum retained tail per output stream, in bytes.                                       |

## Returns

`SandboxProvider`

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function daytona(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Related contracts

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
