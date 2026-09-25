---
title: "dockerSandboxProvider"
description: "dockerSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
```

## Purpose and behavior

Create a Docker sandbox provider. Mounted repository mode shares the workspace and Git metadata; opt-in isolated mode transfers a private checkout. Allocation is deferred until a sandbox acquires the provider; its lease owns container disposal.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                     | Type                                                           | Presence | Meaning                                                                                                       |
| ------------------------ | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optional | Container image, repository mode, mounts, environment, network and resource limits.                           |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optional | Explicit outbound network policy; unsupported restrictions are rejected by the provider.                      |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | mounted shares the host checkout and Git metadata; isolated uses the opt-in private repository transfer mode. |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | Engine-managed dependency cache volumes with independently owned lifetimes.                                   |
| `options.image`          | `string \| undefined`                                          | Optional | Container or guest image reference.                                                                           |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | UID and GID used for commands and ownership inside the container.                                             |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optional | Explicit host-to-sandbox filesystem mounts.                                                                   |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Explicit environment declarations; values are strings.                                                        |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optional | Container network name or names passed to the engine.                                                         |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | Supplementary group names or IDs granted inside the container.                                                |
| `options.devices`        | `readonly string[] \| undefined`                               | Optional | Host device mappings explicitly exposed to the container.                                                     |
| `options.cpus`           | `number \| undefined`                                          | Optional | CPU allocation limit for the execution environment.                                                           |
| `options.memoryMb`       | `number \| undefined`                                          | Optional | Memory allocation limit in megabytes.                                                                         |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | SELinux relabeling for mounted paths: z shared, Z private, false disabled.                                    |
| `options.retain`         | `number \| undefined`                                          | Optional | Maximum retained tail per output stream, in bytes.                                                            |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optional | Podman user-namespace mode; keep-id preserves host user IDs and false disables this option.                   |

## Returns

`import("../index.ts").SandboxProvider`

## Signature

```ts
export declare const dockerSandboxProvider: (
  options?: ContainerOptions,
) => SandboxProvider;
```

## Related contracts

- [ContainerOptions](../containeroptions/)
