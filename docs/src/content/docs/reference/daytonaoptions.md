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

| Name             | Type                                                                           | Presence | Meaning                                                                                                                                                                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caches`         | `readonly CloudDependencyCache[] \| undefined`                                 | Optional | Opt-in download caches under /outpost/cache/&lt;name>, restored on acquire and saved before deletion through each cache’s required transport. Identity includes the canonical host repository, Daytona image/snapshot, sandbox UID/GID, name and key. Non-root images must permit elevated cache-directory setup.                       |
| `repositoryMode` | `"isolated" \| undefined`                                                      | Optional | isolated (the default and only supported mode) keeps the checkout and Git directory private to the cloud sandbox. History and selected inputs upload; validated commits and file changes synchronize back without importing sandbox configuration, hooks or unrelated refs. Other modes fail with code configuration before allocation. |
| `egress`         | `EgressPolicy \| undefined`                                                    | Optional | Portable policy enforced by Daytona: deny-all, up to 100 domains or up to 10 IPv4 allowCidrs, not both, and no denyCidrs. Outpost confirms it before preparing the workspace; a refusal fails with code provider and deletes the sandbox (it needs a Tier 3 or 4 account with WRITE_SANDBOXES).                                         |
| `connection`     | `DaytonaConfig \| undefined`                                                   | Optional | Settings passed to the Daytona client constructor, such as the API key and URL.                                                                                                                                                                                                                                                         |
| `create`         | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optional | Creation parameters passed to the SDK, from an image or a snapshot. Its network fields conflict with egress and otherwise keep Daytona’s semantics without Outpost confirmation; code the image starts on its own can run before acquisition completes.                                                                                 |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                                                                                             |
| `root`           | `string \| undefined`                                                          | Optional | Repository directory inside the sandbox, default &lt;home>/outpost.                                                                                                                                                                                                                                                                     |
| `retain`         | `number \| undefined`                                                          | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                                                                                                    |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly caches?: readonly CloudDependencyCache[];
  readonly repositoryMode?: "isolated";
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

- [CloudDependencyCache](../clouddependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
