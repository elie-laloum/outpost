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

| Name         | Type                                                                           | Presence | Meaning                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`     | `EgressPolicy \| undefined`                                                    | Optional | Optional deny-all, domain or IPv4 CIDR allowlist. Requires successful server confirmation before workspace setup; refusal deletes the sandbox. Requires Tier 3/4 and WRITE_SANDBOXES. Rejects native network options, domain/CIDR mixtures, denyCidrs and implicit wildcard apex access. |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optional | Daytona SDK client connection settings, separate from sandbox creation options.                                                                                                                                                                                                          |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optional | Sandbox creation settings forwarded to the SDK. Native networking without egress follows account-specific Daytona behavior without Outpost enforcement confirmation. Trust image startup code, which can run before acquisition completes.                                               |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                   |
| `root`       | `string \| undefined`                                                          | Optional | Repository workspace path inside the execution environment.                                                                                                                                                                                                                              |
| `retain`     | `number \| undefined`                                                          | Optional | Maximum retained tail per output stream, in bytes.                                                                                                                                                                                                                                       |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly egress?: EgressPolicy;
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Related contracts

- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
