---
title: "Providers — Overview"
description: "Sandbox providers allocate the place where agent commands run: a container, a hosted sandbox, a microVM or the host."
sidebar:
  label: Overview
  order: 0
---

## Which provider to use

Pass a provider as `sandboxProvider`; without one, Outpost uses Docker. Nothing falls back to the host: a missing engine, SDK, credential or KVM fails the acquisition.

| Provider                                                         | Isolation                              | Commands run in                          | Repository                                             | Live input                    |
| ---------------------------------------------------------------- | -------------------------------------- | ---------------------------------------- | ------------------------------------------------------ | ----------------------------- |
| `createDockerSandboxProvider()`, `createPodmanSandboxProvider()` | Container                              | A container on your local engine         | Worktree and Git metadata mounted (`mounted`)          | Yes                           |
| Same, with `repositoryMode: "isolated"`                          | Container, host repository not mounted | A container on your local engine         | History uploaded, changes synchronized back (`remote`) | Yes                           |
| `createVercelSandboxProvider()`                                  | Hosted sandbox                         | A Vercel Sandbox                         | History uploaded, changes synchronized back (`remote`) | Yes                           |
| `createDaytonaSandboxProvider()`                                 | Hosted sandbox                         | A Daytona sandbox                        | History uploaded, changes synchronized back (`remote`) | Yes                           |
| `createFirecrackerSandboxProvider()`                             | MicroVM with its own kernel            | A guest on your Linux KVM host, over SSH | History uploaded, changes synchronized back (`remote`) | Yes                           |
| `createLocalSandboxProvider()`                                   | None                                   | Host processes, in the worktree          | Host worktree used in place (`host`)                   | Yes                           |
| `createMountedSandboxProvider(definition)`                       | What your `acquire()` provides         | Your environment                         | Your `acquire()` mounts the worktree (`mounted`)       | If the lease sets `liveInput` |
| `createRemoteSandboxProvider(definition)`                        | What your `acquire()` provides         | Your environment                         | History uploaded, changes synchronized back (`remote`) | If the lease sets `liveInput` |

:::caution
`createLocalSandboxProvider()` runs the agent with your user’s files, environment and credentials. A mounted container can write the repository’s Git metadata, so it is not a boundary against a hostile agent.
:::

## Which egress rules apply

Set `egress` in the provider options. A provider that cannot enforce a requested rule rejects it with code `configuration` when you create it.

| Provider           | `deny-all` | `domains`                              | `allowCidrs`                     | `denyCidrs` | Enforced by                                   |
| ------------------ | ---------- | -------------------------------------- | -------------------------------- | ----------- | --------------------------------------------- |
| Docker, Podman     | Yes        | No                                     | No                               | No          | The `none` network                            |
| Vercel             | Yes        | Yes                                    | IPv4 and IPv6                    | Yes         | Vercel’s firewall, domains matched by TLS SNI |
| Daytona            | Yes        | Up to 100; list the apex of a wildcard | Up to 10 IPv4, without `domains` | No          | Daytona, confirmed before workspace setup     |
| Local, Firecracker | No         | No                                     | No                               | No          | —                                             |

If Daytona refuses the confirmation, acquisition fails with code `provider` and the sandbox is deleted. Egress covers the sandbox only: harness model requests, image pulls and file transfers leave from the host.

## Entry points

Guide: [Choose a sandbox](../../../guide/choose-a-sandbox/) · [Network restrictions](../../../guide/network-restrictions/) · [Add a sandbox provider](../../../guide/custom-sandbox-providers/)

- [createDockerSandboxProvider](../../createdockersandboxprovider/)
- [createPodmanSandboxProvider](../../createpodmansandboxprovider/)
- [createVercelSandboxProvider](../../createvercelsandboxprovider/)
- [createDaytonaSandboxProvider](../../createdaytonasandboxprovider/)
- [createFirecrackerSandboxProvider](../../createfirecrackersandboxprovider/)
- [createLocalSandboxProvider](../../createlocalsandboxprovider/)
- [createRemoteSandboxProvider](../../createremotesandboxprovider/)
- [createMountedSandboxProvider](../../createmountedsandboxprovider/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)
- [ContainerOptions](../../containeroptions/)
- [EgressPolicy](../../egresspolicy/)
