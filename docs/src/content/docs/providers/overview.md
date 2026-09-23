---
title: "Choose a provider"
description: "Choose a provider — Outpost"
sidebar:
  order: 1
---

The provider controls where commands execute. It does not choose the agent or change workflow semantics.

| Provider    | Placement        | Interactive terminal | Requirements                                 |
| ----------- | ---------------- | -------------------- | -------------------------------------------- |
| `docker()`  | Mounted worktree | Yes                  | Docker engine and generated/custom image     |
| `podman()`  | Mounted worktree | Yes                  | Podman engine and generated/custom image     |
| `local()`   | Host checkout    | Yes                  | Native agent CLI installed and authenticated |
| `vercel()`  | Remote Git copy  | No                   | Vercel credentials and `@vercel/sandbox`     |
| `daytona()` | Remote Git copy  | No                   | Daytona credentials and `@daytona/sdk`       |

Docker is the default. All built-in providers support file/directory transfers through the lease contract, streamed commands and cancellation. Import a provider from `@elie-laloum/outpost/providers/NAME`.

Choose Docker or Podman for local isolation with fast filesystem access. Choose a cloud provider when execution should happen on a remote machine. Choose `local()` only when direct host execution is intended; there is no silent fallback from a failed container to host execution.

Mounted providers expose the selected checkout and shared Git metadata. They do not protect that repository from a hostile agent. Remote providers transfer data to the selected cloud account and synchronize results back. Read [security boundaries](../../operations/security/) and [remote synchronization](../../sandboxes/remote-sync/) before choosing the boundary.

Provider configuration lives in code, so you can create different provider instances for different tasks. Optional cloud SDKs are loaded only through their dedicated entry points. Agent authentication remains a separate concern.
