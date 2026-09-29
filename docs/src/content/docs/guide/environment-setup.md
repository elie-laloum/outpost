---
title: "Prepare the environment"
description: "Install dependencies before agent work and reuse package downloads."
---

Pass `hooks` to workspace or sandbox options to run setup commands. They run in declared order, and a failed command stops preparation.

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";

const hooks: LifecycleHooks = {
  workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
  sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
};
```

## Choose the execution location

| Hook             | Runs                                             |
| ---------------- | ------------------------------------------------ |
| `workspaceReady` | On the host after the Git workspace is prepared. |
| `hostReady`      | On the host during sandbox preparation.          |
| `sandboxReady`   | Inside the allocated sandbox before agent work.  |

Install project dependencies in `sandboxReady` so they match the execution environment. Use `workspaceReady` for host-side preparation that belongs to the workspace’s lifetime.

A warm sandbox does not rerun setup before every turn. Cold allocation runs its setup again. Cache package downloads with [dependency volumes](../environment-setup/) when repeated installation is expensive.

These hooks execute commands. Model-loop hooks instead intercept tool calls and model events: see [Tool policies](../harness-permissions/).

API: [LifecycleHooks](../../reference/lifecyclehooks/).

## Dependency volumes

Container dependency caches reuse engine-managed volumes across sandbox allocations. They preserve package cache data independently of the agent’s private home.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  caches: [{ name: "npm", key: "application-node24" }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Choose a stable key for compatible projects and runtime versions. Change the key when cache compatibility changes. The name identifies `/outpost/cache/<name>`; `npm_config_cache` directs npm to the mounted cache. Volumes are scoped by repository, image, user and key.

### Installation still runs

A download cache does not mean project dependencies are installed. Keep `npm ci` or your package manager’s install command in `sandboxReady`. The package manager validates the project lockfile and reuses compatible downloads.

### Ownership

Closing a sandbox does not remove the cache volume. Manage cache retention with the container engine. Keep credentials and native conversation files out of shared caches. A cache shared between projects also shares their ability to affect cached content.

API: [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
