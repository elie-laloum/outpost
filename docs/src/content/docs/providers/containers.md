---
title: "Docker and Podman"
description: "Docker and Podman — Outpost"
sidebar:
  order: 2
---

Docker and Podman share configuration. Build the project image with [the image CLI](../../start/cli-images/) before acquiring a sandbox.

```ts
import { docker } from "@elie-laloum/outpost/providers/docker";

const provider = docker({
  image: "outpost:project",
  cpus: 2,
  memoryMb: 4096,
  networks: ["development"],
  volumes: [
    {
      source: "~/.config/example",
      target: "~/.config/example",
      readOnly: true,
    },
  ],
  variables: { PROJECT_MODE: "test" },
});
console.log(provider.name);
```

## Options

| Option              | Meaning                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `image`             | Defaults to `outpost:<normalized-repository-directory>`.               |
| `user`              | Explicit `{ uid, gid }`; otherwise POSIX host IDs, or 1000 on Windows. |
| `volumes`           | Source/target mounts with optional `readOnly`.                         |
| `networks`          | One network name or an array.                                          |
| `groups`, `devices` | Extra group IDs/names and device mappings.                             |
| `cpus`, `memoryMb`  | Engine resource constraints.                                           |
| `label`             | SELinux `z` (default on Linux), `Z`, or `false`.                       |
| `retain`            | Captured output tail bound.                                            |
| `userns`            | Podman `"keep-id"` or `false`.                                         |
| `variables`         | Provider environment.                                                  |

Mount sources accept `~`, relative or absolute paths. Relative targets resolve under `/workspace`; `~` targets the agent home. Individual file mounts must target the home; use a directory mount elsewhere. Missing parent directories for file mounts are prepared for the configured agent UID/GID.

Containers use a private ephemeral home, dropped capabilities, no-new-privileges and an init process. Only selected mounts and required Git metadata are exposed; the Docker socket is not mounted automatically. Cancellation stops the current command group without destroying the warm container.

## Platform differences

Preflight checks report image UID mismatches when no user override is supplied. Podman supports rootless user namespaces; on macOS its machine must be running. Linux uses SELinux labels, while Windows/macOS use bind-mount syntax. Git paths are remapped for Windows worktree metadata inside Linux containers.

If permissions fail, verify the image UID/GID, host ownership, Podman namespace and SELinux settings together. Do not fix a mount error by exposing unrelated host directories.
