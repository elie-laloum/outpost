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

| Name         | Type                                                                           | Presence | Meaning                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`     | `EgressPolicy \| undefined`                                                    | Optional | Portable policy enforced by Daytona: deny-all, up to 100 domains or up to 10 IPv4 allowCidrs, not both, and no denyCidrs. Outpost confirms it before preparing the workspace; a refusal fails with code provider and deletes the sandbox (it needs a Tier 3 or 4 account with WRITE_SANDBOXES). |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optional | Settings passed to the Daytona client constructor, such as the API key and URL.                                                                                                                                                                                                                 |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optional | Creation parameters passed to the SDK, from an image or a snapshot. Its network fields conflict with egress and otherwise keep Daytona’s semantics without Outpost confirmation; code the image starts on its own can run before acquisition completes.                                         |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                                                     |
| `root`       | `string \| undefined`                                                          | Optional | Repository directory inside the sandbox, default &lt;home>/outpost.                                                                                                                                                                                                                             |
| `retain`     | `number \| undefined`                                                          | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                                                            |

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
