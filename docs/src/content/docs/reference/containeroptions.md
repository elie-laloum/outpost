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

| Name             | Type                                                           | Presence | Meaning                                                                                                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optional | deny-all only, applied as the none network. An allowlist, or networks other than none, fails with code configuration at creation.                                                                                                                             |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | mounted (default) mounts the worktree at /workspace with its Git metadata. isolated makes the provider remote: the history is uploaded to /tmp/outpost/workspace, volumes cannot expose the host repository, and durable speculation recovery is unavailable. |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | Named engine volumes mounted at /outpost/cache/&lt;name> that outlive the sandbox. The volume is derived from repository, image, user, name and key; explicit volumes must not overlap /outpost/cache.                                                        |
| `image`          | `string \| undefined`                                          | Optional | Image to run, default outpost:&lt;repository directory name>. When user is unset and the image declares another numeric user than yours, acquisition fails with code provider.                                                                                |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | UID and GID of commands in the container, default your host UID and GID (1000:1000 where unavailable).                                                                                                                                                        |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optional | Extra host mounts into the container.                                                                                                                                                                                                                         |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                   |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optional | Engine network or networks to attach, passed as --network.                                                                                                                                                                                                    |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | Supplementary groups for the container user, passed as --group-add.                                                                                                                                                                                           |
| `devices`        | `readonly string[] \| undefined`                               | Optional | Host devices exposed to the container, passed as --device.                                                                                                                                                                                                    |
| `cpus`           | `number \| undefined`                                          | Optional | CPU limit passed as --cpus; must be positive.                                                                                                                                                                                                                 |
| `memoryMb`       | `number \| undefined`                                          | Optional | Memory limit in megabytes, an integer of at least 64.                                                                                                                                                                                                         |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | SELinux relabeling of bind mounts on Linux: z shared (default), Z private, false plain bind mounts.                                                                                                                                                           |
| `retain`         | `number \| undefined`                                          | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                          |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optional | Podman user namespace: keep-id maps your user and applies by default when Outpost does not run as root; false disables it. Docker ignores it.                                                                                                                 |

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
