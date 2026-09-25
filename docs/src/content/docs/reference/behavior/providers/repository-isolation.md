---
title: Repository isolation
description: Opt-in private Git metadata for Docker and Podman.
sidebar:
  order: 4
---

`repositoryMode: "isolated"` is an opt-in prototype for Docker and Podman. It gives each container a private checkout and Git directory at `/tmp/outpost/workspace`. The host checkout and shared Git metadata are not mounted. The default `"mounted"` mode retains its existing behavior.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

await using sandbox = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({
    image: "outpost:project",
    repositoryMode: "isolated",
    networks: "none",
  }),
  branch: { mode: "named", name: "isolated-work" },
});
const result = await sandbox.command({
  executable: "git",
  arguments: ["status", "--short"],
});
console.log(result.stdout);
```

Build the [container image](../../../../guide/environment/providers/agent-images/) first. Omit `networks: "none"` when the task needs network access, including model APIs. Configure authentication using the existing [agent guides](../../../../guide/agents/connect-codex/); the agent home remains private and ephemeral. The image, engine and explicit credentials remain trusted inputs.

## Synchronization and ownership

The provider advertises `placement: "remote"` to use the existing bundle transfer, incoming-history verification, host backup and synchronization pipeline. It still executes on your local container engine. Use a named or integration workspace; `branch: { mode: "current" }` is rejected. An omitted branch defaults to integration, as with remote providers. No remote push is automatic.

Commands, dispatch and attachment synchronize through the application lifecycle. Guest commits and supported working-tree changes return to the host workspace; guest hooks, Git configuration and unrelated refs do not. The guest starts from committed history unless `includeUncommitted` is enabled. Existing dirty files are protected, and concurrent host edits stop synchronization and retain [recovery artifacts](../../../../guide/operations/recovery/). A raw provider lease only allocates the environment; use `createSandbox` or a workspace sandbox to seed and synchronize the repository.

The workspace and container have separate lifetimes. Warm commands reuse the private checkout. Closing the sandbox removes its container storage; recoverable host workspaces and failed synchronization artifacts follow the existing disposal rules. One sandbox owns one repository, with no cross-repository Git transaction.

## Mounts and limits

Explicit bind sources must not overlap the canonical host repository, workspace or Git directories, even when read-only. Symlink aliases and parent directories are checked. Explicit targets must not overlap `/outpost` or `/tmp`, including their parents and descendants. Mount external inputs elsewhere, such as `/inputs`; home file mounts remain supported. [Dependency caches](../../../../guide/environment/providers/dependency-caches/) use separate generated engine volumes under `/outpost/cache`, never host Git directories.

This prototype reduces writable host Git exposure. It is not a certified boundary against hostile agents or container escapes. Trust the image and engine, avoid host path replacement while allocating, and review every explicit mount, device, credential and shared cache. Network access can expose services and credentials independently of filesystem isolation. Code synchronized back to the host can still be dangerous when executed there. Container resource limits, command cancellation, TTY sessions and binary archive transfers retain their usual behavior.
