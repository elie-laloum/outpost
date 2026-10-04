---
title: "Isolation"
description: "Decide what an agent can reach from its sandbox: outbound traffic, your Git metadata, the variables you declare, and the boundaries Outpost does not claim to enforce."
---

## Layers you set yourself

An agent works in a sandbox, not on your machine. Each layer below is chosen on the provider, independently of the agent and the brief.

<!-- features -->

- [Network restrictions](../network-restrictions/): Block all outbound traffic, or allow only the hosts the agent really needs.
  - `deny-all`
  - `allowlist`
- [Private Git](../private-git/): Give the container its own checkout instead of your mounted worktree.
  - `repositoryMode`
  - `isolated`
- [Environment variables](../environment-variables/): Declare which values reach the sandbox, the agent or a single command.
  - `environment`
  - `.outpost/.env`
- [Cloud sandboxes](../cloud-sandboxes/): Move the work off your machine, onto a hosted sandbox.
  - Vercel
  - Daytona
- [Firecracker microVMs](../firecracker/): A separate guest kernel on infrastructure you operate.
  - KVM
  - rootfs
- [Security](../security/): What each boundary covers, and what it leaves open.
  - credentials
  - mounts

## Close a container down

:::caution[Experimental]
Egress policies and private Git are opt-in prototypes. Check that your provider enforces a policy before you rely on it.
:::

Docker and Podman take both layers at once: the container reaches no network and never sees your worktree.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  egress: { mode: "deny-all" },
});
console.log(sandboxProvider.name);
```

Prepare the tools and dependencies in the [image](../agent-images/) first. A CLI agent cut off from the network cannot reach its model; the [built-in harness](../harness/) can, because its model requests leave from your host and only its tools run offline.

## What each layer covers

| Layer              | Set on                       | Keeps the agent away from                   | Available on                                                         |
| ------------------ | ---------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| Egress policy      | The sandbox provider         | Hosts you did not allow                     | Docker and Podman: `deny-all` only; allowlists on Vercel and Daytona |
| Private Git        | Docker or Podman             | Your worktree and your host Git directories | Docker and Podman                                                    |
| Hosted sandbox     | The provider you choose      | Your filesystem, your processes             | Vercel, Daytona, Firecracker                                         |
| Declared variables | `dispatch()` or the provider | Values you did not declare                  | Every provider                                                       |

Remote providers always work on a copy of the history. Host execution isolates nothing: `createLocalSandboxProvider()` runs commands on your machine, and you select it explicitly.

## Limits

- A policy is fixed when the provider is created, and an allowed destination can still receive whatever the agent sends it.
- Egress does not govern traffic Outpost handles itself: harness model requests, image pulls, file transfers and cloud control-plane calls.
- Private Git protects your Git metadata, not your host. You still trust the image, the engine, the kernel and every mount you add.
- The code the agent writes comes back to your machine. Read it before you run it there.
- Nothing falls back to the host: a missing engine, SDK or credential fails the task instead.

API: [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/).
