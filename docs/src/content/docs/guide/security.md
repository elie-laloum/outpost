---
title: "Understand security boundaries"
description: "Review the files, credentials and network access available to agents and host code."
---

## What the agent can reach

An agent can run project commands with the access provided by its sandbox. Review the environment, mounted files and credentials before starting a task; the sandbox provider determines these boundaries.

| Sandbox                                | The agent reaches                                                                                    | Boundary                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Docker and Podman](../containers/)    | The worktree and the repository’s Git metadata, both writable; a private home; declared variables.   | A container with dropped capabilities. Not a boundary against a hostile agent. |
| [Private Git](../private-git/)         | A private checkout and Git directory in the container; a private home; declared variables.           | Your host Git metadata stays out. Commits return only after validation.        |
| [Cloud sandboxes](../cloud-sandboxes/) | A copy of the history with every branch and tag, selected files, credentials and declared variables. | A hosted sandbox in your cloud account. Commits return only after validation.  |
| [Firecracker](../firecracker/)         | The same copy in a microVM with its own guest kernel, reached over SSH.                              | The VM, plus the jailer when you enable it. You operate the host.              |
| [Host execution](../host-process/)     | Everything your user can reach: files, network, your home and your full process environment.         | None.                                                                          |

:::caution
Every volume, device, network and shared cache you add widens that access; a read-only mount still exposes its contents. No sandbox here is certified against container or kernel escapes.
:::

## Credentials and data

Each piece of data goes only where your configuration sends it.

| Data                                                | Where it goes                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Agent login](../authentication/)                   | Outpost reads the selected CLI’s login file on the host, never a system keychain, and copies it into the private sandbox home. Host execution gets variables only. |
| API keys and [variables](../environment-variables/) | Into the sandbox environment. The agent can read every one of them.                                                                                                |
| Provider and storage keys                           | Stay on the host with the [cloud provider](../cloud-sandboxes/) or [transport](../storage/) client. Agents never receive them.                                     |
| Repository and inputs                               | Cloud sandboxes and Firecracker receive the Git history, `copies` and, on request, uncommitted work.                                                               |
| Persisted objects                                   | A transport receives the artifacts, journals, checkpoints, transcripts and recovery data you route to it.                                                          |
| Transcripts, logs and recovery bundles              | Kept on the host or in your transport. They can hold any secret that passed through the agent.                                                                     |

[MCP servers](../mcp-servers/) act with the agent’s authority and receive the variables you name. Their configuration holds variable names, never values. An [MCP login](../mcp-oauth/) copied into a sandbox can rotate its refresh token and sign out the host.

## Code that runs on your host

The sandbox confines the agent’s commands, not your own code. These parts run in the Outpost process or on the host, with your permissions.

<!-- features -->

- [Harness tools](../harness-tools/): `execute` runs in the Outpost process and reaches the sandbox only through `context.sandbox`.
- [Harness hooks](../harness-permissions/): Run in the Outpost process at each step of the built-in loop.
- [Workflow callbacks](../task-dependencies/): Tasks, loop checks and gate verifiers are your code, run by the workflow engine.
- [Preparation hooks](../environment-setup/): `workspaceReady` and `hostReady` commands run on the host, in the worktree.
- [Returned code](../repository-and-branch/): The agent’s commits land in your repository: review them before you build or test on the host.
- [Git metadata](../containers/): A mounted agent can write hooks and configuration in `.git` that your own Git commands then run.

## What Outpost does not authenticate

Outpost records who did what and fences concurrent writers. Identity and permission checks stay in your application.

| Value                                       | What Outpost checks                          | What you check                                                    |
| ------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| [Approval](../approvals/) `actor`           | It is listed in the gate’s `actors`          | Who the person is and whether they may decide.                    |
| Signed gate decision                        | An Ed25519 signature from the actor’s key    | That your signing service authenticated the person.               |
| [Artifact](../artifacts/) `producer`        | The payload matches its digest               | Who published it: anyone who can write the store can.             |
| Conditional writes and revisions            | Stale writers are rejected                   | Who the writer is.                                                |
| Remote PID in [recovery](../recovery/) data | Nothing: it is metadata                      | That the remote process stopped before you recover its ownership. |
| [Task cache](../task-cache/) entry          | Its key and JSON shape                       | Who can write the transport: they choose the restored values.     |
| [Webhook](../webhooks/) signature           | The request comes from the configured source | Whether `event.actor` may start the workflow.                     |
| [HTTP queue](../job-queues/) token          | The caller holds a configured token          | Who holds it: one token grants every queue operation.             |

## What network rules cover

[Network restrictions](../network-restrictions/) limit outbound connections from the sandbox. They do not govern mounts, credentials or host sockets you expose to it.

Traffic that leaves from the host stays outside the policy: built-in harness model requests, image pulls and cloud control-plane calls. An allowed destination can still receive whatever the agent sends it.

## Run agents on untrusted code

Harden the sandbox first. This Docker provider keeps your Git metadata out of the container and blocks its network:

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
  egress: { mode: "deny-all" },
});
```

Without network, a CLI agent cannot reach its model. Use the [built-in harness](../harness/), whose model requests leave from your host, or a [cloud sandbox](../cloud-sandboxes/) with a domain allowlist.

<!-- features -->

- **Isolate Git**: Use [Private Git](../private-git/), a cloud sandbox or Firecracker, never host execution.
- **Mount nothing extra**: Add no volumes, devices, host sockets or shared caches the task does not need.
- **Scope credentials**: Sign in with a dedicated profile through `account.file`, and declare only the keys the task needs.
- **Restrict the network**: Block or allowlist egress where the provider supports it.
- **Keep host hooks trusted**: Run project scripts in `sandboxReady`, not in `hostReady` or `workspaceReady`.
- **Review before running**: Read the returned diff before you build, test or push it on the host.

## Limits

- A mounted container is not a boundary against a hostile agent. Outpost disables Git hooks for its own commands, not for yours or for project tooling.
- Private Git protects your Git metadata, not the host. You still trust the image, the engine, the kernel and every explicit mount.
- With the Firecracker jailer, the Outpost process runs as root. Run only a trusted workflow project and configuration there.
- A cloud account stores what Outpost uploads according to its own storage and network policy.

Report a vulnerability privately through the repository’s [security policy](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/SECURITY.md), without live credentials.

API: [ContainerOptions](../../reference/containeroptions/) · [EgressPolicy](../../reference/egresspolicy/) · [AgentAuthentication](../../reference/agentauthentication/) · [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/) · [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessHook](../../reference/defineharnesshook/).
