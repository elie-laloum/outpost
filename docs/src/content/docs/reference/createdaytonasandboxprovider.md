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

Create a remote provider on Daytona; the optional @daytona/sdk loads on acquire. Each acquire creates a sandbox and confirms any egress policy before preparing the workspace. The checkout is private; repositoryMode accepts only isolated, also the default. Release, or a failed setup, deletes the sandbox.

[Complete example and detailed rules](../../guide/cloud-sandboxes/).

## Parameters and properties

| Name                     | Type                                                                                      | Presence | Meaning                                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `DaytonaOptions \| undefined`                                                             | Optional | Daytona client connection, sandbox creation, egress, workspace root, environment and output retention settings.                                                                                                                                                                                                                         |
| `options.repositoryMode` | `"isolated" \| undefined`                                                                 | Optional | isolated (the default and only supported mode) keeps the checkout and Git directory private to the cloud sandbox. History and selected inputs upload; validated commits and file changes synchronize back without importing sandbox configuration, hooks or unrelated refs. Other modes fail with code configuration before allocation. |
| `options.egress`         | `EgressPolicy \| undefined`                                                               | Optional | Portable policy enforced by Daytona: deny-all, up to 100 domains or up to 10 IPv4 allowCidrs, not both, and no denyCidrs. Outpost confirms it before preparing the workspace; a refusal fails with code provider and deletes the sandbox (it needs a Tier 3 or 4 account with WRITE_SANDBOXES).                                         |
| `options.connection`     | `DaytonaConfig \| undefined`                                                              | Optional | Settings passed to the Daytona client constructor, such as the API key and URL.                                                                                                                                                                                                                                                         |
| `options.create`         | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optional | Creation parameters passed to the SDK, from an image or a snapshot. Its network fields conflict with egress and otherwise keep Daytona’s semantics without Outpost confirmation; code the image starts on its own can run before acquisition completes.                                                                                 |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                           | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                                                                                             |
| `options.root`           | `string \| undefined`                                                                     | Optional | Repository directory inside the sandbox, default &lt;home>/outpost.                                                                                                                                                                                                                                                                     |
| `options.retain`         | `number \| undefined`                                                                     | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                                                                                                    |
| `connect`                | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optional | Returns the client whose create() and delete() manage sandboxes, default new Daytona(connection) from @daytona/sdk.                                                                                                                                                                                                                     |

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
