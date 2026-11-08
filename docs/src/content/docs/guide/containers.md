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

## Mount tooling from another image

Set `imageMounts` to mount files from another image into the sandbox, read-only. Users can then bring their own sandbox image while your platform adds its launcher, Outpost or a CLI from a tooling image it controls. Each entry names an `image`, an optional absolute `path` inside it and a `target` in the sandbox.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "registry.example.com/team/sandbox:3",
  repositoryMode: "isolated",
  imageMounts: [
    {
      image: "registry.example.com/platform/run:1.4",
      path: "/opt/platform",
      target: "/opt/platform",
    },
  ],
});
```

Writes to the mount fail with `Read-only file system`. A target is an absolute path, or a `~/` path in the agent home, outside the workspace, `/tmp` and `/outpost`; invalid entries fail when the provider is created. [ContainerImageMount](../../reference/containerimagemount/) lists every rule.

<!-- features -->

- **Image already on the engine host**: Outpost never pulls a mount image and does not check it beforehand. When it is missing, the engine fails to start the sandbox: Podman reports `image not known`, Docker `No such image`.
- **Engine versions**: Docker Engine 28.0 with the containerd image store, which Docker requires for image mounts and enables by default on fresh Docker 29 installations, or Podman 2.2. A `path` needs Podman 5.1; Docker supports it from 28.0.
- **Docker 28 and repeated images**: Docker 28.0 refuses to mount the same image twice in one sandbox (`AlreadyExists: lease … already exists` at `create`); Docker 29.9 accepts it. On Docker 28, mount each image once, or use separate images.
- **Validation status**: Podman behavior has been verified with rootless Podman 5.4 on Linux, including the remote client through `CONTAINER_HOST`. Docker behavior has been verified by hand with Docker 29.9 and the containerd image store, and the Docker container tests in CI run it on Docker 28.0 with that store.

Check these points before relying on a mount:

<!-- features -->

- **Self-contained tooling**: Mounted files run against the sandbox image's libraries. Ship statically linked binaries or a runtime bundled next to the program: a binary linked against glibc does not run in a musl image such as Alpine, and a CLI that needs Node.js fails in a sandbox image without Node.js.
- **Targets in the home**: Use a direct child of the home, such as `~/tools`, or a path outside it, such as `/opt/tools`. For a deeper target such as `~/.local/bin`, the engine creates the missing folders owned by root, so the agent cannot write beside the mount, for example in `~/.local/share`. A single-file volume cannot sit under an image mount in the home, because Outpost prepares its parent folders inside the read-only image.
- **Nested mounts**: A bind or image mount under an image mount target needs its mountpoint to exist already in the read-only image; otherwise the container fails to start with `Read-only file system`.
- **Remote engines**: Image mounts read no path on the machine running Outpost, so they suit an engine reached through `CONTAINER_HOST` or `podman --remote`. `volumes`, the default `repositoryMode: "mounted"` and file workspaces bound as `mount-readonly` or `mount-write` still read the caller's disk; with a remote engine, use `repositoryMode: "isolated"` ([Private Git](../private-git/)) and no `volumes`.

API reference: [ContainerOptions](../../reference/containeroptions/) and [ContainerImageMount](../../reference/containerimagemount/).

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
- **Your decision**: Removal does not check whether a run still uses the sandbox. A labelled sandbox is listed as soon as its containers are created, before `acquire()` returns, so mark the job active before `acquire()` and clear it only after `release()`. A removed sandbox's next commands fail and its release still succeeds.
- **Reserved prefix**: Keys starting with `io.outpost.` belong to Outpost and are left out of listed labels. Invalid labels, including values with surrounding whitespace, fail when the provider is created.

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
