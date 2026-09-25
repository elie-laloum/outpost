---
title: "podmanSandboxProvider"
description: "podmanSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { podmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Create a Podman sandbox provider using the container execution and streamed-transfer contracts. userns can preserve host UID mapping, and label controls SELinux mount relabeling. The provider is allocated only when acquired by a sandbox.

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
export declare const podmanSandboxProvider: (
  options?: ContainerOptions,
) => SandboxProvider;
```

## Related contracts

- [ContainerOptions](../containeroptions/)
