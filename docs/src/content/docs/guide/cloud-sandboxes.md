---
title: "Cloud sandboxes"
description: "Run agents in Vercel or Daytona sandboxes: Outpost uploads the repository, runs the agent remotely and brings its commits back to your machine."
---

## Prerequisites

Install the SDK of your provider next to Outpost. No local container engine is needed.

```sh
npm install @vercel/sandbox   # Vercel
npm install @daytona/sdk      # Daytona
```

The host needs allocation credentials to create sandboxes. They stay on the host and are separate from the [agent’s credentials](../authentication/), which Outpost installs in the sandbox’s private home.

| Provider | Allocation credentials on the host                                                                 |
| -------- | -------------------------------------------------------------------------------------------------- |
| Vercel   | `VERCEL_OIDC_TOKEN` (from `npx vercel env pull`), or `token`, `teamId` and `projectId` in `create` |
| Daytona  | `DAYTONA_API_KEY`, or `apiKey` in `connection`                                                     |

The sandbox image needs `sh` and `git` to synchronize the repository, and `node` to stream input to the agent.

## Vercel Sandbox

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const sandboxProvider = createVercelSandboxProvider({
  create: { runtime: "node24", timeout: 30 * 60_000 },
});
```

Vercel stops a sandbox after `create.timeout` milliseconds: set it longer than your task.

<!-- features -->

- `create`: Passes creation settings to the Vercel SDK: runtime, image or snapshot `source`, `resources`, `timeout`.
  - `runtime`
  - `timeout`
- `root`: Sets where the repository lives in the sandbox. Defaults to `/vercel/sandbox/outpost`.
  - `root`
- `variables`: Declares the [variables](../environment-variables/) every command in the sandbox receives.
  - `variables`

API: [createVercelSandboxProvider](../../reference/createvercelsandboxprovider/) · [VercelOptions](../../reference/verceloptions/).

## Daytona Sandbox

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

export const sandboxProvider = createDaytonaSandboxProvider({
  connection: { apiKey: process.env.DAYTONA_API_KEY ?? "" },
  create: { image: "node:24" },
});
```

<!-- features -->

- `connection`: Configures the Daytona client: API key, API URL, target region.
  - `apiKey`
  - `target`
- `create`: Chooses an `image` or a `snapshot`, with resources and auto-stop settings.
  - `image`
  - `snapshot`
- `root`: Sets where the repository lives in the sandbox. Defaults to `outpost` in the sandbox user’s home.
  - `root`
- `variables`: Declares the [variables](../environment-variables/) every command in the sandbox receives.
  - `variables`

API: [createDaytonaSandboxProvider](../../reference/createdaytonasandboxprovider/) · [DaytonaOptions](../../reference/daytonaoptions/).

## Compare Vercel and Daytona

|                                          | Vercel                                                | Daytona                                     |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `attach()`                               | No: interactive terminals are rejected                | Yes, through Daytona’s PTY API              |
| [Live input](../steering/)               | Each instruction is appended to a file in the sandbox | Same                                        |
| [Egress rules](../network-restrictions/) | Native firewall: domains, CIDRs allowed and denied    | Confirmed by Daytona: domains or IPv4 CIDRs |
| Billing                                  | Until Outpost stops the sandbox                       | Until Outpost deletes the sandbox           |

Live input costs one provider command per instruction: a wrapper started with the agent reads the file and feeds its standard input.

## Run a task

Pass the provider to `dispatch()` or `createSandbox()` as with any sandbox.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
import { coder, repository } from "./outpost.config.mts";

const result = await dispatch({
  agent: coder,
  repository,
  sandboxProvider: createDaytonaSandboxProvider({
    create: { image: "node:24" },
  }),
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  brief: {
    text: "Fix the failing test in src/date.test.ts and commit the fix.",
  },
});
console.log(result.branch, result.commits.length);
```

Before the first turn, Outpost installs the agent’s CLI at its pinned version if the image lacks it, on every remote sandbox. Set `bootstrap: false` when the image must provide it. The `sandboxReady` hook then installs the project’s dependencies ([Prepare the environment](../environment-setup/)).

`dispatch()` releases the sandbox when it returns. Close a sandbox from `createSandbox()` in `finally`, or with `await using`: the provider bills it until then.

## Repository access

The sandbox works on its own copy of the repository. Outpost keeps it in step with the managed worktree on your machine. [Firecracker](../firecracker/) and [private Git](../private-git/) containers synchronize the same way.

<!-- flow -->

1. **Upload**: When the sandbox starts.
   - **Send the history**: A Git bundle of the repository, checked out on the work branch.
     - host
     - sandbox
   - **Send selected files**: `copies`, and uncommitted work when `includeUncommitted` is set.
     - host
     - sandbox
2. **Run**: The agent works and commits in the sandbox.
   - **Run the operation**: `dispatch()`, `command()` or `attach()`.
     - sandbox
3. **Bring back**: After every operation.
   - **Download**: New commits, uncommitted edits and new untracked files.
     - sandbox
   - **Validate**: Check the commits and that the worktree did not change meanwhile.
     - host
   - **Back up**: Save the worktree’s state under `.outpost/recovery`.
     - host
   - **Apply**: Fast-forward the work branch and apply the edits.
     - host

## Choose the branch

Without `branch`, a cloud sandbox uses `integrate`: a new `outpost/job-…` branch, merged into your current branch at the end. `named` keeps the work on a branch you name. `current` is rejected, because the sandbox cannot edit your checkout in place. See [Repository and branch](../repository-and-branch/).

## Send files Git does not have

The sandbox receives committed files only. Two options add more.

<!-- features -->

- `copies`: Copies paths from your checkout into the worktree, then uploads them. Use it for ignored inputs such as `.env.test`.
  - your checkout
- `includeUncommitted`: Sends the managed worktree’s uncommitted changes and untracked, non-ignored files.
  - managed worktree
- **Commit first**: Commits on the work branch travel with the history.
  - Git

:::caution
`includeUncommitted` reads the managed worktree under `.outpost/workspaces`, not your checkout. Edits you have not committed in your checkout reach the sandbox only through `copies`.
:::

A copy that `.gitignore` excludes travels one way: the agent’s edits to it stay in the sandbox. Any other copy becomes uncommitted work in the worktree, so pass `includeUncommitted: true` with it.

## When synchronization stops

Outpost never overwrites work it cannot back up. It stops with an error whose `details.recovery` names the directory under `.outpost/recovery` holding the downloaded changes and the backup. Inspect it with [Recover work](../recovery/).

| Cause                                                           | Fix                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| The managed worktree changed while the sandbox was open         | Leave `.outpost/workspaces` alone during the run          |
| The agent changed a file that is uncommitted in the worktree    | Commit the file first, or pass `includeUncommitted: true` |
| The agent created a file your host ignores outside `.gitignore` | Move the ignore rule into the committed `.gitignore`      |
| The agent rewrote a commit that was already synchronized        | Ask for new commits instead of an amend or a rebase       |

`recoveryTransport` on `dispatch()` or `createSandbox()` also archives each backup to [object storage](../object-storage/).

## Limits

- **All refs upload**: The history bundle holds every branch and tag of the repository, not only the work branch.
- **Command deadline**: `sandbox.command()` without `deadlineMs` stops after 10 minutes. Agent turns follow their own [limits](../limits-and-cancellation/).
- **Output tail**: A command result keeps the last 64 KiB of each stream. `retain` on the provider changes it.
- **Bootstrap**: Installing the CLI needs `npm` (or `curl` for Antigravity) and network access in the sandbox. With a [fallback agent](../fallback-agents/), only the first candidate is installed.
- **Unplanned exits**: Outpost releases sandboxes on `SIGINT` and `SIGTERM`. A killed process leaves the sandbox running until the provider’s own timeout.

Implementing another remote provider: [Add a sandbox provider](../custom-sandbox-providers/).

API: [SandboxOptions](../../reference/sandboxoptions/) · [EgressPolicy](../../reference/egresspolicy/).
