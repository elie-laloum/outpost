---
title: "Use Docker or Podman"
description: "Configure local containers, repository mounts and the user that runs agent commands."
---

## Prerequisites

<!-- features -->

- **Docker or Podman**: Installed and running. On macOS, start a Podman machine with `podman machine start`.
- [An agent image](../agent-images/): Contains the agent CLIs your tasks will use.
- **A Git repository**: The checkout the container mounts.

Before running a task, check that the container engine responds and the agent image is available:

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

API reference: [ContainerOptions](../../reference/containeroptions/), [Volume](../../reference/volume/) and [DependencyCache](../../reference/dependencycache/).

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

Choose SELinux labels that match your host instead of loosening repository permissions.

API reference: [ContainerOptions](../../reference/containeroptions/).

`outpost init --sandbox-provider podman` writes a `Containerfile` instead of a `Dockerfile`.

## Limits

- The provider never falls back to host execution. If the engine or image is missing, allocation fails; run [Diagnostics](../diagnostics/).
- The image must provide `sh`, `setsid`, `kill`, `tar` and `cp`. Generated images do.
- When the image declares a numeric user that differs from the requested UID, allocation fails. Rebuild the image with your UID or set `user`.
- `egress` accepts only `deny-all`. Domain allowlists need a [cloud sandbox](../cloud-sandboxes/) or an external firewall.
- A single file can be mounted only inside the agent home; mount its directory for other destinations.
- Mounted checkout and Git metadata are writable: this is not a boundary against a hostile agent ([Security](../security/)).

API: [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/) · [Volume](../../reference/volume/) · [DependencyCache](../../reference/dependencycache/).
