---
title: "Dependency volumes"
description: "Reuse package downloads between containers."
---

Container dependency caches reuse engine-managed volumes across sandbox allocations. They preserve package cache data independently of the agent’s private home.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  caches: [{ name: "npm", key: "application-node24" }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Choose a stable key for compatible projects and runtime versions. Change the key when cache compatibility changes. The name identifies `/outpost/cache/<name>`; `npm_config_cache` directs npm to the mounted cache. Volumes are scoped by repository, image, user and key.

## Installation still runs

A download cache does not mean project dependencies are installed. Keep `npm ci` or your package manager’s install command in `sandboxReady`. The package manager validates the project lockfile and reuses compatible downloads.

## Ownership

Closing a sandbox does not remove the cache volume. Manage cache retention with the container engine. Keep credentials and native conversation files out of shared caches. A cache shared between projects also shares their ability to affect cached content.

API: [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
