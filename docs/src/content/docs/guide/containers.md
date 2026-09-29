---
title: "Docker and Podman"
description: "Run each agent task in a local Docker or Podman container that sees only your checkout and its Git metadata."
---

## Prerequisites

<!-- features -->

- **Docker or Podman**: Installed and running. On macOS, start a Podman machine with `podman machine start`.
- [An agent image](../agent-images/): Built by `outpost init` with the agent CLIs your tasks use.
- **A Git repository**: The checkout the container mounts.

Check the engine and the image before the first task:

```sh
npx outpost doctor --sandbox-provider docker --image outpost:dev
```

## Configure

Both providers take the same options. Pass the provider to `dispatch()`, `createSandbox()` or any workflow task.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

Each allocation starts a fresh container from the image. Closing the sandbox removes it.

| Option           | Effect                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `image`          | Image to start. Default: `outpost:<repository folder name>`.                                    |
| `cpus`           | CPU limit, a positive number.                                                                   |
| `memoryMb`       | Memory limit in megabytes, at least 64.                                                         |
| `variables`      | Variables set in every command ([Environment variables](../environment-variables/)).            |
| `volumes`        | Extra host paths to mount, optionally read-only.                                                |
| `caches`         | Named volumes that keep package downloads ([dependency caches](../environment-setup/)).         |
| `user`           | UID and GID of the container user. Default: yours on the host, 1000:1000 on Windows.            |
| `groups`         | Supplementary group names or IDs.                                                               |
| `devices`        | Host devices exposed to the container.                                                          |
| `networks`       | Engine networks to join. Not a domain allowlist.                                                |
| `egress`         | `{ mode: "deny-all" }` runs without network ([Network restrictions](../network-restrictions/)). |
| `repositoryMode` | `"mounted"` (default) or `"isolated"` ([Private Git](../private-git/)).                         |
| `retain`         | Bytes of output kept per stream. Default: 65,536.                                               |
| `userns`         | Podman user namespace: `"keep-id"` or `false`. See [Podman](#podman).                           |
| `label`          | SELinux relabeling of mounts on Linux: `"z"` (default), `"Z"` or `false`.                       |

## Repository access

The container mounts the task's checkout at `/workspace` and the repository's Git metadata under `/outpost/git`. The agent's edits and commits land directly on the host, in the worktree Outpost prepared.

<!-- features -->

- **Private home**: `/home/agent` is a tmpfs, discarded with the container. The harness copies the agent's [credentials](../authentication/) there.
- **Reduced privileges**: Linux capabilities are dropped (`CHOWN` stays when caches, file mounts or Private Git need it) and `no-new-privileges` is set.
- **No engine access**: The Docker or Podman socket is never mounted.

To expose more host paths, add `volumes`. A relative `source` starts from the repository; a `target` starting with `~/` lands in the agent home, any other relative `target` under `/workspace`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
});
```

Every mount, device and network you add widens what the agent can reach. To keep the host Git metadata out of the container, use [Private Git](../private-git/).

## Podman

Rootless Podman maps your host user into the container with `--userns keep-id`, so files the agent writes stay owned by you. Set `userns: false` to leave the mapping to your Podman configuration. When Podman runs as root, set `userns: "keep-id"` to request it.

On Linux, both engines relabel mounts with `z` (shared SELinux label) by default. Use `label: "Z"` for a private label, or `label: false` to mount without relabeling. Match these settings to the host instead of loosening repository permissions.

`outpost init --sandbox-provider podman` writes a `Containerfile` instead of a `Dockerfile`.

## Limits

- The provider never falls back to host execution. If the engine or image is missing, allocation fails; run [Diagnostics](../diagnostics/).
- The image must provide `sh`, `setsid`, `kill`, `tar` and `cp`. Generated images do.
- When the image declares a numeric user that differs from the requested UID, allocation fails. Rebuild the image with your UID or set `user`.
- `egress` accepts only `deny-all`. Domain allowlists need a [cloud sandbox](../cloud-sandboxes/) or an external firewall.
- A single file can be mounted only inside the agent home; mount its directory for other destinations.
- Mounted checkout and Git metadata are writable: this is not a boundary against a hostile agent ([Security](../security/)).

API: [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/) · [Volume](../../reference/volume/) · [DependencyCache](../../reference/dependencycache/).
