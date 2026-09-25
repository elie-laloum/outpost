---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Parameters and properties

| Name         | Type                                                                           | Presence | Meaning                                                                         |
| ------------ | ------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------- |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optional | Daytona SDK client connection settings, separate from sandbox creation options. |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optional | Sandbox creation options forwarded to the provider’s SDK.                       |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optional | Explicit environment declarations; values are strings.                          |
| `root`       | `string \| undefined`                                                          | Optional | Repository workspace path inside the execution environment.                     |
| `retain`     | `number \| undefined`                                                          | Optional | Maximum retained tail per output stream, in bytes.                              |

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
