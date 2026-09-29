---
title: "Docker and Podman"
description: "Run agents in local Docker or Podman containers."
---

Start Docker and build an [agent image](../agent-images/). Pass the provider to `dispatch()` or `createSandbox()`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

## Repository access

The default mode mounts the checkout and required Git metadata. Changes are visible through those mounts. A private ephemeral home holds the agent’s configuration and credential copy.

Docker drops capabilities, uses no-new-privileges and creates a private home. The Docker socket is not mounted by default. Extra mounts, devices and networks expand the environment’s access.

## Customize the environment

`volumes` adds explicit host paths with optional read-only access. `user` selects UID/GID; `groups` adds groups. `networks` connects runtime networks; it is not a domain allowlist. Use [outbound rules](../network-restrictions/) for supported egress restrictions.

Use [dependency volumes](../environment-setup/) for package caches and [private Git](../private-git/) to avoid mounting host Git metadata. These options have separate lifetimes and ownership rules.

The provider never falls back to host execution if the engine or image is unavailable. Run [preflight checks](../diagnostics/) to diagnose setup.

API: [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [ContainerOptions](../../reference/containeroptions/).

## Podman

Start Podman and build the image with `outpost init --yes --sandbox-provider podman --image outpost:dev`. Pass the provider to `dispatch()` or `createSandbox()`.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

### Repository access

The default mode mounts the checkout and required Git metadata. Changes are visible through those mounts. A private ephemeral home holds the agent’s configuration and credential copy.

For rootless execution, check UID/GID mapping and host mount permissions. `userns` selects keep-id behavior; `label` controls SELinux relabeling (`z`, `Z` or false). Match these settings to your host rather than changing repository permissions broadly.

### Customize the environment

`volumes` adds explicit host paths with optional read-only access. `user` selects UID/GID; `groups` adds groups. `networks` connects runtime networks; it is not a domain allowlist. Use [outbound rules](../network-restrictions/) for supported egress restrictions.

Use [dependency volumes](../environment-setup/) for package caches and [private Git](../private-git/) to avoid mounting host Git metadata. These options have separate lifetimes and ownership rules.

The provider never falls back to host execution if the engine or image is unavailable. Run [preflight checks](../diagnostics/) to diagnose setup.

API: [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [ContainerOptions](../../reference/containeroptions/).
