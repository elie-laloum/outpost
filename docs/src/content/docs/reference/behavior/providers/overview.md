---
title: "Choose a provider"
description: "Choose a provider — Outpost"
sidebar:
  order: 1
---

The provider controls where commands execute. It does not choose the agent or change workflow semantics.

| Provider        | Placement                    | Interactive terminal | Requirements                                          |
| --------------- | ---------------------------- | -------------------- | ----------------------------------------------------- |
| `docker()`      | Mounted or isolated checkout | Yes                  | Docker engine and generated/custom image              |
| `podman()`      | Mounted or isolated checkout | Yes                  | Podman engine and generated/custom image              |
| `local()`       | Host checkout                | Yes                  | Native agent CLI installed and authenticated          |
| `vercel()`      | Remote Git copy              | No                   | Vercel credentials and `@vercel/sandbox`              |
| `daytona()`     | Remote Git copy              | Yes                  | Daytona credentials and `@daytona/sdk`                |
| `firecracker()` | Private microVM Git copy     | No                   | Prepared Linux KVM, TAP, guest and SSH; research only |

Docker is the default. All built-in providers support file/directory transfers through the lease contract, streamed commands and cancellation. Import a provider from `@elie-laloum/outpost/providers/NAME`.

Choose Docker or Podman for local isolation with fast filesystem access. Choose a cloud provider when execution should happen on a remote machine. Choose `local()` only when direct host execution is intended; there is no silent fallback from a failed container to host execution.

Mounted providers expose the selected checkout and shared Git metadata. They do not protect that repository from a hostile agent. Remote providers transfer data to the selected cloud account and synchronize results back. Read [security boundaries](../../../../guide/operations/security/) and [remote synchronization](../../../../guide/environment/remote-sync/) before choosing the boundary.

Provider configuration lives in code, so you can create different provider instances for different tasks. Optional cloud SDKs are loaded only through their dedicated entry points. Agent authentication remains a separate concern.

Docker/Podman default to mounted Git metadata; opt into the [isolated repository prototype](../../../../guide/advanced/repository-isolation/) for a private checkout synchronized through bundles. [Firecracker](../../../../guide/advanced/firecracker/) is a research backend requiring a prepared Linux host; its simulated tests do not establish a real boot or a production security boundary. [Outbound network policies](../../../../guide/advanced/egress/) support container deny-all and Vercel firewall policies, with provider-specific limits.
