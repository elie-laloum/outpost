---
title: Dependency caches
description: Reuse package downloads across Docker and Podman sandboxes.
sidebar:
  order: 3
---

Docker and Podman accept opt-in `caches` in their provider options. Each cache is a persistent engine volume at `/outpost/cache/<name>`. Without this option, Outpost creates no persistent dependency cache. Vercel, Daytona and `local()` do not implement this option; use their explicit filesystem capabilities separately.

## Cache package downloads

Choose a key from the lockfile, package-manager version, target architecture and any other inputs that change the cached format. Outpost does not inspect lockfiles or automatically invalidate keys. This example hashes the lockfile explicitly; resolve it from the target repository, independently of the workflow directory.

```ts
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSandbox, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const repository = "/path/to/repository";
const lock = await readFile(join(repository, "package-lock.json"));
const key = `npm-v11-linux-amd64-${createHash("sha256").update(lock).digest("hex")}`;
const box = await createSandbox({
  repository,
  agent: codex(),
  provider: docker({
    image: "outpost:project",
    caches: [{ name: "npm", key }],
    variables: { NPM_CONFIG_CACHE: "/outpost/cache/npm" },
  }),
});
try {
  const result = await box.command({ executable: "npm", arguments: ["ci"] });
  if (result.status !== 0) throw new Error(result.stderr);
} finally {
  await box.close();
}
```

For Podman, replace the factory/import with `podman` from `@elie-laloum/outpost/providers/podman`. The same cache contract applies to rootless Podman, using its container user mapping.

| Tool | Cache declaration       | Configuration inside the sandbox               |
| ---- | ----------------------- | ---------------------------------------------- |
| npm  | `{ name: "npm", key }`  | `NPM_CONFIG_CACHE=/outpost/cache/npm`          |
| pnpm | `{ name: "pnpm", key }` | `pnpm install --store-dir /outpost/cache/pnpm` |
| pip  | `{ name: "pip", key }`  | `PIP_CACHE_DIR=/outpost/cache/pip`             |
| uv   | `{ name: "uv", key }`   | `UV_CACHE_DIR=/outpost/cache/uv`               |

Install the selected tool in your image first. Cache downloaded packages, wheels or stores; keep project installations such as `node_modules` in the workspace. Do not redirect `HOME`, `CODEX_HOME`, agent configuration or authentication files into a dependency cache.

## Ownership, isolation and invalidation

Names contain up to 48 lowercase letters, digits or hyphens and start with a letter. Keys are nonempty strings of at most 1024 characters. Duplicate names and explicit mounts overlapping `/outpost/cache` are rejected.

The volume identity hashes the canonical repository path, image reference, container UID/GID, cache name and key, with a format version. Thus branches in one repository can reuse a cache, while other repositories, users, images and keys get different volumes. Docker and Podman retain volumes in their separate engine stores. A mutable image tag keeps the same cache identity when rebuilt; use a digest-pinned image or change the key when toolchain contents change.

Enabling caches adds the `CHOWN` capability to the otherwise dropped capability set, as with existing nested file mounts. Outpost initializes only the volume root to the requested UID/GID and mode `0700`; it never recursively changes cached files. Changing UID/GID creates a fresh volume. The private agent home remains a separate ephemeral tmpfs. No agent credentials or home files are copied into the volume during initialization. Files that your commands explicitly put in a cache remain there, so cache contents must stay appropriate for every task sharing that key.

Simultaneous leases with the same identity share a writable cache. Outpost does not serialize package-manager writes: use a tool whose cache supports concurrent writers, or give independent jobs different keys. The cache is a performance optimization, not an integrity boundary against another task using the same key.

Changing the key selects an empty cache and retains the old volume. Closing a sandbox, failing allocation or cancelling a command does not delete persistent cache data. There is no automatic eviction. The engine owner is responsible for disk usage and removal after active leases close.

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume inspect EXACT_VOLUME_NAME
docker volume rm EXACT_VOLUME_NAME
```

Use the equivalent `podman volume` commands for Podman. Inspect and remove individual volumes; do not prune unrelated engine resources. See [prebuilt agent images](../agent-images/) to reduce image setup time too.

Cache volumes are outside the [repository storage quotas](../../operations/storage-retention/).
