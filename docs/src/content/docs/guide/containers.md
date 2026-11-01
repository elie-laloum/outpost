---
title: "Use Docker or Podman"
description: "Configure local containers, repository mounts and the user that runs agent commands."
---

## Prerequisites

<!-- features -->

- **Docker or Podman**: Installed and running. On macOS, start a Podman machine with `podman machine start`.
- [An agent image](../agent-images/): Contains the agent CLIs your tasks will use.
- [Working files](../working-with-files/): This procedure mounts a Git checkout; directory and ephemeral sources also work without Git.

Before running a task, check that the container engine responds and the agent image is available:

```sh
npx outpost doctor --provider docker --image outpost-codex:dev
```

## Configure

Both providers take the same options. Pass the provider to `dispatch()`, `createSandbox()` or any workflow task.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost-codex:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

Each allocation starts a fresh container from the image. Closing the sandbox removes it.

API reference: [ContainerOptions](../../reference/containeroptions/), [Volume](../../reference/volume/) and [DependencyCache](../../reference/dependencycache/).

## Repository access

The container mounts the task's checkout at `/workspace` and the repository's Git metadata under `/outpost/git`. The agent's edits and commits land directly on the host, in the worktree Outpost prepared.

<!-- features -->

- **Private home**: `/home/agent` is a tmpfs with mode `0700`, owned by the configured user and discarded with the container. The harness copies the agent's [credentials](../authentication/) there.
- **Reduced privileges**: Linux capabilities are dropped (`CHOWN` stays for Podman home ownership, or when caches, file mounts or Private Git need it) and `no-new-privileges` is set.
- **No engine access**: The Docker or Podman socket is never mounted.

To expose more host paths, add `volumes`. A relative `source` starts from the repository; a `target` starting with `~/` lands in the agent home, any other relative `target` under `/workspace`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
});
```

Every mount, device and network you add widens what the agent can reach. To keep the host Git metadata out of the container, use [Private Git](../private-git/).

## Podman

Rootless Podman maps your host user into the container with `--userns keep-id`, so files the agent writes stay owned by you. Set `userns: false` to leave the mapping to your Podman configuration. When Podman runs as root, set `userns: "keep-id"` to request it.

On SELinux hosts, keep the default `label: "z"` when mounts are shared by containers. Use `"Z"` for a private mount used by one container, or `false` when your host policy already handles labels. These settings change mount labels, not project permissions.

API reference: [ContainerOptions](../../reference/containeroptions/).

`outpost image eject --engine podman` writes a `Containerfile` instead of a `Dockerfile`.

## Find sandboxes by label

Set `labels` to tag every sandbox a provider creates. The `create` command that creates the container sets them, and so does the one that creates its [egress companion](../network-restrictions/), so a container never exists without its labels.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  repositoryMode: "isolated",
  labels: { "com.example.app": "reviews", "com.example.job": "job-42" },
});
```

A cleanup process can then find the sandboxes your application owns, including those whose name it never recorded. `listDockerSandboxes()` returns each Outpost sandbox that carries every given label, with its name and labels. `removeDockerSandbox()` removes a sandbox with its egress companion and succeeds when they are already gone. Podman has `listPodmanSandboxes()` and `removePodmanSandbox()`.

```ts title="reap.ts"
import {
  listDockerSandboxes,
  removeDockerSandbox,
} from "@elie-laloum/outpost/providers/docker";

declare function isJobActive(job: string): Promise<boolean>;

const sandboxes = await listDockerSandboxes({
  labels: { "com.example.app": "reviews" },
});
for (const sandbox of sandboxes) {
  const job = sandbox.labels["com.example.job"];
  if (job && (await isJobActive(job))) continue;
  await removeDockerSandbox(sandbox.name, { deadlineMs: 30_000 });
}
```

<!-- features -->

- **Any repository mode**: Both functions work without the provider, whatever `repositoryMode` created the sandboxes.
- **Outpost containers only**: Only containers named `outpost-<uuid>` are listed or removed, never other containers carrying the same labels.
- **Your decision**: Removal does not check whether a run still uses the sandbox. That run's next commands fail and its release still succeeds.
- **Reserved prefix**: Keys starting with `io.outpost.` belong to Outpost. Invalid labels fail when the provider is created.

Listing requires at least one label. The engine reports image labels too, so choose keys your images do not set.

API reference: [ContainerOptions](../../reference/containeroptions/), [listDockerSandboxes](../../reference/listdockersandboxes/), [removeDockerSandbox](../../reference/removedockersandbox/) and [ContainerSandbox](../../reference/containersandbox/).

## Limits

- The provider never falls back to host execution. If the engine or image is missing, allocation fails; run [Diagnostics](../diagnostics/).
- The image must provide `sh`, `setsid`, `kill`, `tar` and `cp`. Generated images do.
- When the image declares a numeric user that differs from the requested UID, allocation fails. Rebuild the image with your UID or set `user`.
- `egress` accepts only `deny-all`. Domain allowlists need a [cloud sandbox](../cloud-sandboxes/) or an external firewall.
- A single file can be mounted only inside the agent home; mount its directory for other destinations.
- Mounted checkout and Git metadata are writable: this is not a boundary against a hostile agent ([Security](../security/)).

API: [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [listDockerSandboxes](../../reference/listdockersandboxes/) · [listPodmanSandboxes](../../reference/listpodmansandboxes/) · [removeDockerSandbox](../../reference/removedockersandbox/) · [removePodmanSandbox](../../reference/removepodmansandbox/) · [ContainerOptions](../../reference/containeroptions/) · [Volume](../../reference/volume/) · [DependencyCache](../../reference/dependencycache/).
