---
title: "Private Git"
description: "Give a Docker or Podman agent its own copy of the repository instead of your mounted checkout, and bring its commits back only after validation."
---

## Turn it on

:::caution[Experimental]
Private Git is an opt-in prototype: its behavior can still change.
:::

Set `repositoryMode: "isolated"` on the Docker or Podman provider. The rest of your code stays the same.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { coder, repository } from "./outpost.config.mts";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/private-fix" },
  brief: { text: "Fix the failing unit test and commit the fix." },
});
console.log(result.branch, result.commits.length);
```

Outpost copies the branch history into the container and the agent works on that copy. When the task ends, its commits land on `outpost/private-fix` on your host.

## What changes compared with mounted mode

| Aspect                                 | Mounted (default)                                              | Isolated                                                                   |
| -------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| What the container sees                | Your worktree at `/workspace` and the host Git directories     | A private checkout at `/tmp/outpost/workspace` with its own `.git`         |
| How changes come back                  | At once: the agent writes to your worktree                     | After each dispatch, `sandbox.command()` or attach, validated then applied |
| Host hooks, config, refs               | Shared and writable: what the agent writes applies on the host | Not copied in or back: only the branch’s commits and files return          |
| Default branch policy                  | `current`                                                      | `integrate`; `current` is rejected                                         |
| Agent CLI                              | Must be in the image                                           | Installed in the sandbox when missing; `bootstrap: false` turns this off   |
| [Durable speculation](../speculation/) | Supported                                                      | Rejected: the provider cannot recover abandoned containers                 |
| Interactive terminal                   | Supported                                                      | Supported; changes come back when you quit                                 |

`copies` and `includeUncommitted` select extra inputs as on [cloud sandboxes](../cloud-sandboxes/). Branch policies: [Repository and branch](../repository-and-branch/).

## Bring changes back safely

Isolated containers use the same synchronization as cloud sandboxes. Before applying anything, Outpost validates the incoming commits and files and backs up the host worktree.

If the host worktree changed while the sandbox was active, or incoming files overlap uncommitted or ignored host files, synchronization stops. Your host files stay untouched, and the error’s `details.recovery` names a transfer directory under `.outpost/recovery/`. Inspect and restore it with [Recover work](../recovery/).

## Mount extra directories

`volumes` still works, within three rules:

<!-- features -->

- **Host side**: A source cannot contain or sit inside the repository, the worktree or the Git directories, even read-only.
- **Container side**: A target cannot overlap `/tmp` or `/outpost`; relative targets resolve inside the checkout and are rejected.
- **Dependency caches**: `caches` volumes keep working; Outpost mounts them under `/outpost/cache`.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
  caches: [{ name: "npm", key: "node24" }],
});
```

## Limits

- Isolation protects your host Git metadata, not your host from a hostile agent. You still trust the image, the container engine, the kernel and every explicit mount. See [Security](../security/).
- The code the agent writes comes back to your host. Review it before running it there.
- Only Docker and Podman have this mode. Cloud sandboxes and Firecracker always work on a copy; host execution never does.

API: [ContainerOptions](../../reference/containeroptions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [Volume](../../reference/volume/).
