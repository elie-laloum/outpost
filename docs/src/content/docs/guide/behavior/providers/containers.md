---
title: "Docker and Podman"
description: "Docker and Podman — Outpost"
sidebar:
  order: 2
---

Docker and Podman share configuration. Build the project image with [the image CLI](../../../manual/cli-images/) before acquiring a sandbox.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
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
console.log(sandboxProvider.name);
```

## Options

| Option              | Meaning                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `repositoryMode`    | `"mounted"` (default) or opt-in `"isolated"`; see [repository isolation](../../../advanced/repository-isolation/). |
| `image`             | Defaults to `outpost:<normalized-repository-directory>`.                                                           |
| `user`              | Explicit `{ uid, gid }`; otherwise POSIX host IDs, or 1000 on Windows.                                             |
| `volumes`           | Source/target mounts with optional `readOnly`.                                                                     |
| `networks`          | One network name or an array.                                                                                      |
| `groups`, `devices` | Extra group IDs/names and device mappings.                                                                         |
| `cpus`, `memoryMb`  | Engine resource constraints.                                                                                       |
| `label`             | SELinux `z` (default on Linux), `Z`, or `false`.                                                                   |
| `retain`            | Captured output tail bound.                                                                                        |
| `userns`            | Podman `"keep-id"` or `false`.                                                                                     |
| `variables`         | Provider environment.                                                                                              |

Mount sources accept `~`, relative or absolute paths. Relative targets resolve under `/workspace` in mounted mode; isolated mode reserves its `/tmp/outpost/workspace` root and rejects relative workspace mounts; `~` targets the agent home. Individual file mounts must target the home; use a directory mount elsewhere. Missing parent directories for file mounts are prepared for the configured agent UID/GID.

Containers use a private ephemeral home, dropped capabilities, no-new-privileges and an init process. Mounted mode exposes selected mounts and required Git metadata; isolated mode copies repository content and history into private container storage; the Docker socket is not mounted automatically. Cancellation stops the current command group without destroying the warm container.

## Platform differences

Preflight checks report image UID mismatches when no user override is supplied. Podman supports rootless user namespaces; on macOS its machine must be running. Linux uses SELinux labels, while Windows/macOS use bind-mount syntax. Git paths are remapped for Windows worktree metadata inside Linux containers.

If permissions fail, verify the image UID/GID, host ownership, Podman namespace and SELinux settings together. Do not fix a mount error by exposing unrelated host directories.

## File transfers

Transfers stream binary tar archives through the running container, including files in its tmpfs home. The host needs tar (GNU tar or bsdtar); custom images need tar, cp and util-linux setsid with --wait support. Generated images include these tools. No archive is converted to text or limited by the command output retention setting. Temporary staging is removed after transfer.

A directory copied to an existing directory is placed under its source basename. A source ending in /. copies its contents. Files, ordinary permissions and symbolic links are preserved; ownership becomes the receiving user. Downloads refuse existing destination symlinks and symlink parents. Special devices and FIFOs are not supported. Authentication and transcript paths stay in the same ephemeral home.

After upgrading, rebuild generated images to include the writable home: for existing Dockerfiles add mkdir/chown/chmod for /home/agent before USER. Regenerating a scaffold does not overwrite your existing files.
