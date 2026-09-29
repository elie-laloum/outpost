---
title: "Private Git"
description: "Run with a private container checkout and Git directory."
---

:::note[Experimental]
Private Git mode is an opt-in container isolation prototype.
:::

Set `repositoryMode: "isolated"` on Docker or Podman to avoid mounting the host checkout and Git metadata.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  repositoryMode: "isolated",
});
```

Outpost transfers repository history into a private checkout and validates synchronization back to the host. Host hooks, configuration and unrelated refs are not copied back. Concurrent host edits can still stop synchronization.

## Mount constraints

Explicit mounts overlapping the canonical repository, worktree, Git directories or container control paths are rejected, including read-only mounts. Dependency cache volumes remain separate.

This mode does not certify hostile-agent isolation or protection from container escapes. Trust the image, engine, kernel and explicit external mounts. It also does not make project code safe to run later on the host.

See [Recovering changes](../failure-recovery/) for interrupted synchronization and the [roadmap](../../project/roadmap/) for remaining live-validation prerequisites.

API: [ContainerOptions](../../reference/containeroptions/).
