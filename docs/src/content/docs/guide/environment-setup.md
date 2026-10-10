---
title: "Prepare the agent’s environment"
description: "Install project dependencies before an agent starts and reuse download caches."
---

Use this guide when a task fails because project tools or dependencies are missing. Keep the [agent image](../agent-images/) for installed tools and use preparation hooks for the repository’s dependencies. A download cache can speed installation up; it does not replace installation.

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

<span id="reinstall-only-when-files-change"></span>
<span id="reuse-downloads-across-containers"></span>
<span id="reuse-downloads-in-cloud-sandboxes"></span>
<span id="manage-cache-volumes"></span>

For this step, follow [Reuse dependency downloads](../dependency-caches/).

## Limits

- Local and Firecracker providers have no `caches`: `sandboxReady` downloads everything on each allocation.
- Each hook command stops after 10 minutes unless you set `deadlineMs`.
- At allocation, a command that exits with a nonzero status rejects with an `OutpostError` of code `process`, stops the other preparation commands and releases the sandbox. See [Errors](../error-handling/).
- Commands run without a shell. Call `sh -c` for pipes and `&&`.
- Cache names start with a lowercase letter and hold at most 48 lowercase letters, digits or hyphens. Explicit `volumes` cannot overlap `/outpost/cache`.
- Every sandbox that mounts a cache can change its content, and later sandboxes read it. Keep credentials out of caches ([Security](../security/)).

API: [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [openWorkspace](../../reference/openworkspace/) · [LifecycleHooks](../../reference/lifecyclehooks/) · [Command](../../reference/command/) · [ContainerOptions](../../reference/containeroptions/) · [DependencyCache](../../reference/dependencycache/).
