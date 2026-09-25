---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name             | Type                                                           | Presence | Meaning                                                                                                       |
| ---------------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optional | Explicit outbound network policy; unsupported restrictions are rejected by the provider.                      |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | mounted shares the host checkout and Git metadata; isolated uses the opt-in private repository transfer mode. |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | Engine-managed dependency cache volumes with independently owned lifetimes.                                   |
| `image`          | `string \| undefined`                                          | Optional | Container or guest image reference.                                                                           |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | UID and GID used for commands and ownership inside the container.                                             |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optional | Explicit host-to-sandbox filesystem mounts.                                                                   |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Explicit environment declarations; values are strings.                                                        |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optional | Container network name or names passed to the engine.                                                         |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | Supplementary group names or IDs granted inside the container.                                                |
| `devices`        | `readonly string[] \| undefined`                               | Optional | Host device mappings explicitly exposed to the container.                                                     |
| `cpus`           | `number \| undefined`                                          | Optional | CPU allocation limit for the execution environment.                                                           |
| `memoryMb`       | `number \| undefined`                                          | Optional | Memory allocation limit in megabytes.                                                                         |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | SELinux relabeling for mounted paths: z shared, Z private, false disabled.                                    |
| `retain`         | `number \| undefined`                                          | Optional | Maximum retained tail per output stream, in bytes.                                                            |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optional | Podman user-namespace mode; keep-id preserves host user IDs and false disables this option.                   |

## Signature

```ts
export interface ContainerOptions {
  readonly egress?: EgressPolicy;
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Related contracts

- [DependencyCache](../dependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
- [Volume](../volume/)
