---
title: "Prepare the agent’s environment"
description: "Install project dependencies before an agent starts and reuse download caches."
---

## Install dependencies before agent work

Use a `sandboxReady` hook to install project dependencies before the agent starts. The command runs in the prepared sandbox, so the agent can use the installed packages during its task.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  hooks: {
    sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
  },
  brief: { text: "Run the tests and fix the first failure." },
});
reportValue(result.text);
// Example output: Fixed the failing tests and committed the change.
```

`npm ci` runs inside the sandbox, in the repository root. The agent starts with `node_modules` installed. `createSandbox()` and `openWorkspace()` accept the same `hooks`; `speculate()` takes them under `sandbox`.

## Choose where each hook runs

API reference: [LifecycleHooks](../../reference/lifecyclehooks/).

`hostReady` and `sandboxReady` run at the same time. Install dependencies in `sandboxReady`: they then match the sandbox's operating system and architecture.

:::caution
`sandboxReady` commands start together. Chain dependent steps in one command: `{ executable: "sh", arguments: ["-c", "npm ci && npm run build"] }`.
:::

Each entry is a [command](../sandbox-sessions/): `executable`, `arguments`, and optionally `directory`, `variables` and `deadlineMs`. These hooks prepare the environment; to intercept the agent's tool calls, see [Permissions and hooks](../harness-permissions/).

## Prepare once for several turns

A sandbox runs unconditional hooks once, when it is allocated. `sandbox.dispatch()`, `sandbox.resume()` and `sandbox.command()` reuse the prepared environment. Each top-level `dispatch()` allocates a fresh sandbox and runs them again.

A workspace from `openWorkspace()` runs `workspaceReady` once when it opens. It runs `hostReady` and `sandboxReady` for each sandbox it creates, unless that sandbox passes its own `hooks`, which replace the workspace's.

## Reinstall only when files change

Add `when: changed(["package-lock.json"])` to check file contents before each `sandbox.command()`, `dispatch()` (including resume and fork) or `attach()`. The first preparation always runs the hook; later operations skip it until a watched file changes. These additions are implemented under Unreleased.

```ts
import { changed, createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  hooks: {
    sandboxReady: [
      {
        executable: "npm",
        arguments: ["ci"],
        when: changed(["package-lock.json"]),
      },
    ],
  },
});
await sandbox.command({ executable: "npm", arguments: ["test"] });
```

Outpost hashes the watched files inside the hook's execution environment, relative to its `directory` or the workspace root. List exact file paths, without glob patterns, absolute paths or `..`. Content changes, creation and deletion count; timestamps do not. Missing files have a stable fingerprint; an unreadable file fails preparation. Node.js must be available in that environment.

Each hook keeps its own fingerprint in memory for this sandbox, recorded only after success. A failed, timed-out or cancelled preparation blocks the requested operation and is retried on the next call; the sandbox remains open. A new sandbox always prepares again. Only declared files are watched: deleting `node_modules` alone does not trigger installation. A hook that changes a watched file runs again on the next operation.

`hostReady` supports the same condition on host files. `workspaceReady` is evaluated once at workspace opening. Ordering stays the same: host commands run sequentially, sandbox commands run concurrently, and both groups overlap. No hook runs between passes of one dispatch; file changes made during an operation are checked at the next operation.

API: [changed](../../reference/changed/) · [LifecycleCommand](../../reference/lifecyclecommand/) · [ChangedCondition](../../reference/changedcondition/). The repository's `examples/60-incremental-preparation/index.ts` demonstrates `npm ci` without account credentials or network access.

## Reuse downloads across containers

Docker and Podman providers accept `caches`: named volumes that survive the container. Point your package manager at the mounted directory.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  caches: [{ name: "npm", key: "node24" }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Each cache is mounted at `/outpost/cache/<name>`, owned by the container user. The next sandbox with the same key finds the downloads there. Change `key` when cached content stops being compatible, for example after a runtime upgrade.

| Package manager | Variable            |
| --------------- | ------------------- |
| npm             | `npm_config_cache`  |
| Yarn            | `YARN_CACHE_FOLDER` |
| pip             | `PIP_CACHE_DIR`     |
| Go modules      | `GOMODCACHE`        |

Keep the install command in `sandboxReady`. The cache saves downloads, not the installed project: the package manager still checks the lockfile and fills `node_modules`.

## Reuse downloads in cloud sandboxes

Vercel and Daytona accept the same cache name and compatibility key, plus a `transport` for each cache. This example uses a private S3 prefix; install `@aws-sdk/client-s3` alongside Outpost. The caller owns the S3 client and must destroy it after closing all sandboxes.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const client = new S3Client({});
const s3 = createS3Transport({
  client,
  bucket: "my-private-bucket",
  prefix: "outpost-downloads",
});
export const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24" },
  caches: [{ name: "npm", key: "app-node24", transport: s3 }],
  variables: { npm_config_cache: "/outpost/cache/npm" },
});
```

Restoration finishes before `sandboxReady`; keep `npm ci` or `pip install` in that hook. Downloads are archived when the sandbox closes, after all warm commands and turns, including normal cleanup after a failed or cancelled run. Storage credentials stay on the host. `createLocalTransport()` also works when successive cloud runs share one host.

The identity uses the same hash recipe as container caches: canonical host repository, execution image, UID/GID, name and key. In the cloud, the image component includes the provider and its configured runtime/image/source (Vercel) or image/snapshot (Daytona). Different providers and host checkout paths do not share archives. Pin images and change `key` when a mutable image or package-manager version changes compatibility.

A cloud sandbox receives its own snapshot. The first run to publish against the revision it restored wins; a stale concurrent publisher keeps the newer snapshot and discards its update. The cache is not a merged filesystem. Missing caches start empty. Other transport, archive or transfer failures fail acquisition or closing; closing still attempts sandbox disposal and reports both failures if necessary.

Archives preserve files, binary bytes, permissions and symlinks; empty directories are recreated by the package manager. The existing archive limits apply: 1 GiB of payload, 100,000 files and a 16 MiB manifest. Restoration and each cache save have a 60-second deadline. Commands create `/outpost/cache/<name>` and assign it to the sandbox user; non-root images must permit elevated setup.

Objects live under `dependency-caches/` in the transport. Immutable snapshots, including superseded or unpublished snapshots, remain until you remove them. Remove a cache’s entire prefix only after stopping every reader and writer; deleting chunks used by an active restoration makes it fail. No snapshot pruning is automatic. A killed runner or an expired cloud sandbox may leave the latest downloads unsaved. Deterministic SDK fixtures cover the behavior; live Vercel, Daytona and S3 validation remains pending.

API: [CloudDependencyCache](../../reference/clouddependencycache/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/) · [Transport](../../reference/transport/).

## Manage cache volumes

A volume is shared by sandboxes with the same repository, image, container user, cache name and key. Closing a sandbox and `outpost image remove` keep it. Outpost labels its volumes `io.outpost.cache=true`:

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume rm $(docker volume ls -q --filter label=io.outpost.cache=true)
```

Podman accepts the same commands with `podman`.

## Limits

- Local and Firecracker providers have no `caches`: `sandboxReady` downloads everything on each allocation.
- Each hook command stops after 10 minutes unless you set `deadlineMs`.
- At allocation, a command that exits with a nonzero status rejects with an `OutpostError` of code `process`, stops the other preparation commands and releases the sandbox. See [Errors](../error-handling/).
- Commands run without a shell. Call `sh -c` for pipes and `&&`.
- Cache names start with a lowercase letter and hold at most 48 lowercase letters, digits or hyphens. Explicit `volumes` cannot overlap `/outpost/cache`.
- Every sandbox that mounts a cache can change its content, and later sandboxes read it. Keep credentials out of caches ([Security](../security/)).

API: [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [openWorkspace](../../reference/openworkspace/) · [LifecycleHooks](../../reference/lifecyclehooks/) · [Command](../../reference/command/) · [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
