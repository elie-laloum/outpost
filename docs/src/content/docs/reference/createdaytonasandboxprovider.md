---
title: "createDaytonaSandboxProvider"
description: "createDaytonaSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
```

## Purpose and behavior

Create a remote Daytona provider with separate SDK connection and sandbox creation settings. Repository transfers use the acquired remote environment, and synchronization validates concurrent host edits before applying changes. Optional egress is validated before allocation and confirmed through the server network-update API before workspace setup; failure triggers deletion. Native image startup precedes that confirmation. See [outbound rules](../../guide/network-restrictions/).

[Complete example and detailed rules](../../guide/choose-a-sandbox/).

## Parameters and properties

| Name                 | Type                                                                                      | Presence | Meaning                                                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optional | Daytona client connection, sandbox creation, workspace root, environment and output retention settings.                                                                                                                                                                                  |
| `options.egress`     | `EgressPolicy \| undefined`                                                               | Optional | Optional deny-all, domain or IPv4 CIDR allowlist. Requires successful server confirmation before workspace setup; refusal deletes the sandbox. Requires Tier 3/4 and WRITE_SANDBOXES. Rejects native network options, domain/CIDR mixtures, denyCidrs and implicit wildcard apex access. |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optional | Daytona SDK client connection settings, separate from sandbox creation options.                                                                                                                                                                                                          |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optional | Sandbox creation settings forwarded to the SDK. Native networking without egress follows account-specific Daytona behavior without Outpost enforcement confirmation. Trust image startup code, which can run before acquisition completes.                                               |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                   |
| `options.root`       | `string \| undefined`                                                                     | Optional | Repository workspace path inside the execution environment.                                                                                                                                                                                                                              |
| `options.retain`     | `number \| undefined`                                                                     | Optional | Maximum retained tail per output stream, in bytes.                                                                                                                                                                                                                                       |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optional | Injected factory returning a Daytona client with create/delete methods for sandbox lifecycle.                                                                                                                                                                                            |

## Returns

`SandboxProvider`

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function createDaytonaSandboxProvider(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Related contracts

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
