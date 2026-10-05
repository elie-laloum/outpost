---
title: "Prepare the agent’s environment"
description: "Install project dependencies before an agent starts and reuse download caches."
---

## Install dependencies before agent work

Use a `sandboxReady` hook to install project dependencies before the agent starts. The command runs in the prepared sandbox, so the agent can use the installed packages during its task.

```ts
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
console.log(result.text);
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

A sandbox runs its hooks once, when it is allocated. `sandbox.dispatch()`, `sandbox.resume()` and `sandbox.command()` reuse the prepared environment. Each top-level `dispatch()` allocates a fresh sandbox and runs them again.

A workspace from `openWorkspace()` runs `workspaceReady` once when it opens. It runs `hostReady` and `sandboxReady` for each sandbox it creates, unless that sandbox passes its own `hooks`, which replace the workspace's.

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

## Manage cache volumes

A volume is shared by sandboxes with the same repository, image, container user, cache name and key. Closing a sandbox and `outpost image remove` keep it. Outpost labels its volumes `io.outpost.cache=true`:

```sh
docker volume ls --filter label=io.outpost.cache=true
docker volume rm $(docker volume ls -q --filter label=io.outpost.cache=true)
```

Podman accepts the same commands with `podman`.

## Limits

- Other providers have no `caches`: `sandboxReady` downloads everything on each allocation.
- Each hook command stops after 10 minutes unless you set `deadlineMs`.
- A command that exits with a nonzero status rejects with an `OutpostError` of code `process`, stops the other preparation commands and releases the sandbox. See [Errors](../error-handling/).
- Commands run without a shell. Call `sh -c` for pipes and `&&`.
- Cache names start with a lowercase letter and hold at most 48 lowercase letters, digits or hyphens. Explicit `volumes` cannot overlap `/outpost/cache`.
- Every sandbox that mounts a cache can change its content, and later sandboxes read it. Keep credentials out of caches ([Security](../security/)).

API: [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [openWorkspace](../../reference/openworkspace/) · [LifecycleHooks](../../reference/lifecyclehooks/) · [Command](../../reference/command/) · [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
