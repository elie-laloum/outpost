---
title: "Setup"
description: "Generate a workflow project or add Outpost to your application, with Docker and a Codex account."
---

There are two ways to start. Generate a workflow project with `outpost init` to see an agent work in a few minutes, or install the package in your own application and write its configuration. Both use Docker and a Codex account; see [Choose an agent](../choose-an-agent/) and [Choose a sandbox](../choose-a-sandbox/) for other options.

## Prerequisites

- Node.js 24 or later.
- A Git repository with at least one commit.
- Docker or Podman installed and running.

## Sign in to Codex

Sign in on the host with the Codex CLI, storing credentials in a file:

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copies `~/.codex/auth.json` (or `$CODEX_HOME/auth.json`) into the sandbox’s private home, and the agent uses your ChatGPT plan. For API keys or another agent, see [Authentication](../authentication/).

## Path A: generate a workflow project

Run `init` from your repository and answer the questions, or pass `--yes` to accept the defaults (Codex, Docker, account sign-in, npm):

```sh
npx @elie-laloum/outpost init --image outpost:dev
npx @elie-laloum/outpost init --yes --install --image outpost:dev
```

`init` writes these files and stops rather than overwrite an existing one:

- `run.ts`: the workflow script (`run.mts` when `package.json` declares `"type": "commonjs"`).
- `brief.md`: the instructions sent to the agent, with an `{{OBJECTIVE}}` placeholder.
- `.env.example`: the variables your sign-in method needs (none for a Codex account). The script reads them from `.env` or the environment.
- `Dockerfile` (`Containerfile` with Podman): the [agent image](../agent-images/) recipe.
- `.gitignore`: ignores `.env`, `node_modules/` and Outpost’s runtime directories; rules are appended to an existing file.
- `package.json`: only when the directory has none.

With Docker or Podman, `init` then builds the image; the first build downloads the agent CLIs. Pass `--no-build` to skip it. Without `--install`, install the dependencies yourself (`npm install`). Use `--directory` and `--repository` to keep the workflow outside the target checkout; see [CLI commands](../cli/).

## Path B: use Outpost in your application

Install the package:

```sh
npm install @elie-laloum/outpost
```

The configuration below uses the image `outpost:dev`. If you followed path A, it already exists. Otherwise, generate a recipe in a separate directory and build it:

```sh
npx outpost init --yes --directory outpost-image --image outpost:dev
```

Then save the configuration next to your scripts:

```ts title="outpost.config.mts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});

export const repository = process.env.OUTPOST_REPOSITORY ?? process.cwd();
```

`coder` is the Codex agent signed in with your account, `sandboxProvider` starts a container from `outpost:dev` for each task, and `repository` is the checkout the agent works on. Outpost does not load this file by itself: import these names from each script that needs them. Set `OUTPOST_REPOSITORY` to an absolute path when you run scripts outside the target repository.

## Check the setup

Before the first paid call, check the host, the container engine and the image:

```sh
npx outpost doctor --image outpost:dev
```

`doctor` checks Docker and Codex by default; select others with `--sandbox-provider` and `--agent`, and add `--json` for a machine-readable report. It exits with status 1 when a check fails. It does not test authentication or model access. See [Diagnostics](../diagnostics/).

## Run the generated project

In a path A project, pass the objective as arguments:

```sh
node run.ts "Describe this repository"
```

The script reports progress on stderr, then prints the work branch, the commits the agent made and its conversation. Press Ctrl+C to cancel; the script prints recovery details.

The generated script uses `branch: { mode: "integrate" }`: when the agent commits, Outpost merges its work branch into the branch checked out in your repository. To review changes before they land, change it to a named branch in `run.ts`, as in [Repository and branch](../repository-and-branch/).

## Next

Run your own task from TypeScript in [Your first task](../first-request/).

API: [createAgent](../../reference/createagent/) · [createCodexHarness](../../reference/createcodexharness/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
