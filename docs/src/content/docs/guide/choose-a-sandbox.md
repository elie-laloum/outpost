---
title: "Choose a sandbox"
description: "Compare the built-in sandbox providers and pick where agent commands run: a local container, a cloud sandbox, a microVM or the host."
---

## Built-in providers

A sandbox provider decides where the agent's commands run. You choose it independently of the agent.

<!-- features -->

- [Docker](../containers/): The default: a local container started from an image you build.
  - `createDockerSandboxProvider()`
  - mounted
- [Podman](../containers/): The same container provider on the Podman engine, rootless included.
  - `createPodmanSandboxProvider()`
  - mounted
- [Vercel](../cloud-sandboxes/): A hosted sandbox that needs no local engine.
  - `createVercelSandboxProvider()`
  - remote
- [Daytona](../cloud-sandboxes/): A hosted sandbox that also supports interactive terminals.
  - `createDaytonaSandboxProvider()`
  - remote
- [Firecracker](../firecracker/): A microVM on a Linux host with KVM that you prepare.
  - `createFirecrackerSandboxProvider()`
  - remote
- [Host execution](../host-process/): Commands run directly on your machine, without isolation.
  - `createLocalSandboxProvider()`
  - host

## Decide

<!-- path -->

1. [Docker and Podman](../containers/): A repeatable environment on your machine or a CI runner. Start here.
2. [Cloud sandboxes](../cloud-sandboxes/): Work that must run away from the host, with outbound allowlists.
3. [Firecracker microVMs](../firecracker/): A separate guest kernel on infrastructure you operate.
4. [Host execution](../host-process/): Trusted code that needs the tools installed on your machine.

## Use a provider

Import the provider from its subpath and pass it as `sandboxProvider`. The agent, the brief and the branch stay the same.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";
import { coder, repository } from "./outpost.config.mts";

const result = await dispatch({
  agent: coder,
  repository,
  sandboxProvider: createVercelSandboxProvider(),
  brief: { text: "Fix the broken links in the README and commit the change." },
});
console.log(result.branch, result.commits.length);
```

Each provider has its own subpath, `@elie-laloum/outpost/providers/<name>`: `docker`, `podman`, `vercel`, `daytona`, `firecracker` and `local`. Omit `sandboxProvider` and Outpost uses Docker.

Vercel and Daytona load their SDK when they allocate a sandbox. Install it next to Outpost: `npm install @vercel/sandbox` or `npm install @daytona/sdk`. The other providers need no extra package.

## Compare providers

|                                                  | Docker, Podman   | Vercel                         | Daytona                 | Firecracker                        | Host                |
| ------------------------------------------------ | ---------------- | ------------------------------ | ----------------------- | ---------------------------------- | ------------------- |
| Repository access                                | Mounted worktree | Uploaded snapshot              | Uploaded snapshot       | Uploaded snapshot                  | Host filesystem     |
| Isolation                                        | Container        | Hosted sandbox                 | Hosted sandbox          | MicroVM                            | None                |
| Interactive [`attach()`](../sandbox-sessions/)   | Yes              | No                             | Yes                     | No                                 | Yes                 |
| Live input for [steering](../steering/)          | Yes              | Yes                            | Yes                     | Yes                                | Yes                 |
| [Dependency caches](../containers/)              | Yes              | No                             | No                      | No                                 | No                  |
| [Egress rules](../network-restrictions/)         | `deny-all` only  | Yes                            | Yes, with limits        | No                                 | No                  |
| [Durable speculation](../speculation/) recovery  | Yes              | No                             | No                      | No                                 | No                  |
| Installs a missing agent CLI                     | No               | Yes                            | Yes                     | Yes                                | No                  |
| Default [branch mode](../repository-and-branch/) | `current`        | `integrate`                    | `integrate`             | `integrate`                        | `current`           |
| Setup                                            | Engine and image | `@vercel/sandbox`, credentials | `@daytona/sdk`, API key | KVM host, kernel, rootfs, TAP, SSH | Agent CLI and tools |

Remote providers (Vercel, Daytona, Firecracker) work on a copy of the Git history. They install a missing supported CLI before the first turn unless you pass `bootstrap: false`, and they reject the `current` branch mode.

With `repositoryMode: "isolated"`, Docker and Podman behave like a remote provider: see [Private Git](../private-git/).

## Limits

- Nothing falls back to the host. A missing engine, SDK or credential fails the task; only `createLocalSandboxProvider()` runs on the host, and you choose it explicitly.
- A mounted container can write the repository's Git metadata. It is not a boundary against a hostile agent: read [Security](../security/).
- Remote synchronization stops instead of overwriting concurrent host edits, and keeps recovery data. See [Cloud sandboxes](../cloud-sandboxes/).
- A Firecracker provider owns one TAP device and runs one VM at a time. Create one provider per concurrent VM.

API: [SandboxProvider](../../reference/sandboxprovider/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/) · [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/) · [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/).
