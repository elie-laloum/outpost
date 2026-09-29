---
title: "createPodmanSandboxProvider"
description: "createPodmanSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Create the container provider on the Podman engine, with the same options as Docker. When Outpost does not run as root, userns keep-id maps your user by default; on macOS a Podman machine must be running.

[Complete example and detailed rules](../../guide/containers/).

## Parameters and properties

| Name                     | Type                                                           | Presence | Meaning                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optional | Container image, repository mode, mounts, environment, network and resource limits.                                                                                                                                                                           |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optional | deny-all only, applied as the none network. An allowlist, or networks other than none, fails with code configuration at creation.                                                                                                                             |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | mounted (default) mounts the worktree at /workspace with its Git metadata. isolated makes the provider remote: the history is uploaded to /tmp/outpost/workspace, volumes cannot expose the host repository, and durable speculation recovery is unavailable. |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | Named engine volumes mounted at /outpost/cache/&lt;name> that outlive the sandbox. The volume is derived from repository, image, user, name and key; explicit volumes must not overlap /outpost/cache.                                                        |
| `options.image`          | `string \| undefined`                                          | Optional | Image to run, default outpost:&lt;repository directory name>. When user is unset and the image declares another numeric user than yours, acquisition fails with code provider.                                                                                |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | UID and GID of commands in the container, default your host UID and GID (1000:1000 where unavailable).                                                                                                                                                        |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optional | Extra host mounts into the container.                                                                                                                                                                                                                         |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                   |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optional | Engine network or networks to attach, passed as --network.                                                                                                                                                                                                    |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | Supplementary groups for the container user, passed as --group-add.                                                                                                                                                                                           |
| `options.devices`        | `readonly string[] \| undefined`                               | Optional | Host devices exposed to the container, passed as --device.                                                                                                                                                                                                    |
| `options.cpus`           | `number \| undefined`                                          | Optional | CPU limit passed as --cpus; must be positive.                                                                                                                                                                                                                 |
| `options.memoryMb`       | `number \| undefined`                                          | Optional | Memory limit in megabytes, an integer of at least 64.                                                                                                                                                                                                         |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | SELinux relabeling of bind mounts on Linux: z shared (default), Z private, false plain bind mounts.                                                                                                                                                           |
| `options.retain`         | `number \| undefined`                                          | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                          |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optional | Podman user namespace: keep-id maps your user and applies by default when Outpost does not run as root; false disables it. Docker ignores it.                                                                                                                 |

## Returns

`SandboxProvider`

## Signature

```ts
export declare const createPodmanSandboxProvider: (
  options?: ContainerOptions,
) => SandboxProvider;
```

## Related contracts

- [ContainerOptions](../containeroptions/)
