---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name             | Type                                                           | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optional | deny-all uses the none network. An allowlist starts a dedicated proxy and namespace firewall before sandbox commands: domains allow HTTP on port 80 and HTTPS CONNECT on 443 with matching TLS SNI; CIDRs allow raw TCP/UDP, with denyCidrs taking precedence. Explicit networks conflict with an allowlist. See the network guide for image publication and validation limits.                                                                                                                                                                                                                                 |
| `egressImage`    | `string \| undefined`                                          | Optional | Override the trusted companion image for an allowlist. Use an immutable digest in production. The engine downloads a missing image. Omitting this option uses the public amd64/arm64 image pinned by verified digest in Outpost. Build images/egress and set this explicitly to test a local companion. The image must implement the matching Outpost egress runtime protocol.                                                                                                                                                                                                                                  |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | mounted (default) mounts the worktree at /workspace with its Git metadata. isolated makes the provider remote: the history is uploaded to /tmp/outpost/workspace, volumes cannot expose the host repository, and durable speculation recovery is unavailable.                                                                                                                                                                                                                                                                                                                                                   |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | Named engine volumes mounted at /outpost/cache/&lt;name> that outlive the sandbox. The volume is derived from repository, image, user, name and key; explicit volumes must not overlap /outpost/cache.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `image`          | `string \| undefined`                                          | Optional | Image to run, default outpost:&lt;repository directory name>. When user is unset and the image declares another numeric user than yours, acquisition fails with code provider.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | UID and GID of sandbox commands, default your host IDs (1000:1000 where unavailable). UID 65532 is reserved for the dedicated egress proxy when an allowlist is configured.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optional | Extra host mounts into the container.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `imageMounts`    | `readonly ContainerImageMount[] \| undefined`                  | Optional | Read-only mounts of images already present on the engine host, with the ContainerImageMount rules. Unlike volumes, they read no path on the machine running Outpost, so they also work with a remote engine. Provider creation validates every entry, including unknown fields and reserved targets, and throws a ConfigurationError located at imageMounts.&lt;index>. Outpost neither pulls nor checks the images: a missing image makes the engine fail to start the sandbox, with Podman's image not known or Docker's No such image. Image mounts always use --mount syntax; label does not apply to them. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optional | Engine networks passed as --network. An egress allowlist refuses explicit networks because Outpost owns the filtered network namespace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | Supplementary groups for the container user, passed as --group-add.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `devices`        | `readonly string[] \| undefined`                               | Optional | Host devices exposed to the container, passed as --device.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `cpus`           | `number \| undefined`                                          | Optional | CPU limit passed as --cpus; must be positive.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `memoryMb`       | `number \| undefined`                                          | Optional | Memory limit in megabytes, an integer of at least 64.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | SELinux relabeling of bind mounts on Linux: z shared (default), Z private, false plain bind mounts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `labels`         | `Readonly<Record<string, string>> \| undefined`                | Optional | Caller labels set by the create command of the sandbox container and of its egress companion, so they exist as soon as the container does, with the ContainerLabels rules. Invalid or reserved labels fail at provider creation with a ConfigurationError located at labels.&lt;key>; a reserved key also carries a hint. listDockerSandboxes and listPodmanSandboxes find sandboxes by these labels. Unrelated to label, which controls SELinux relabeling.                                                                                                                                                    |
| `retain`         | `number \| undefined`                                          | Optional | Bytes of output tail kept per stream, default 65536.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optional | Podman user namespace: keep-id maps your user and applies by default when Outpost does not run as root; false disables it. Docker ignores it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Signature

```ts
export interface ContainerOptions {
  readonly egress?: EgressPolicy;
  readonly egressImage?: string;
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly imageMounts?: readonly ContainerImageMount[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly labels?: ContainerLabels;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Related contracts

- [ContainerImageMount](../containerimagemount/)
- [ContainerLabels](../containerlabels/)
- [DependencyCache](../dependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
- [Volume](../volume/)
