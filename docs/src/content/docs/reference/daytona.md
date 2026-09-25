---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Purpose and behavior

Create a remote Daytona provider with separate SDK connection and sandbox creation settings. Repository transfers use the acquired remote environment, and synchronization validates concurrent host edits before applying changes.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                 | Type                                                                                      | Presence | Meaning                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optional | Daytona client connection, sandbox creation, workspace root, environment and output retention settings. |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optional | Daytona SDK client connection settings, separate from sandbox creation options.                         |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optional | Sandbox creation options forwarded to the provider’s SDK.                                               |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optional | Explicit environment declarations; values are strings.                                                  |
| `options.root`       | `string \| undefined`                                                                     | Optional | Repository workspace path inside the execution environment.                                             |
| `options.retain`     | `number \| undefined`                                                                     | Optional | Maximum retained tail per output stream, in bytes.                                                      |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optional | Injected factory returning a Daytona client with create/delete methods for sandbox lifecycle.           |

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
