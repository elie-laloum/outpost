---
title: "Setup"
description: "Generate a ready-to-run workflow project (path A) or add Outpost to your application (path B), both with Docker and a Codex account."
---

## Prerequisites

Other agents and sandboxes: [Choose an agent](../choose-an-agent/), [Choose a sandbox](../choose-a-sandbox/).

<!-- features -->

- **Node.js 24+**: Runs Outpost and your scripts.
- **A Git repository**: With at least one commit.
- **Docker or Podman**: Installed and running.

## Sign in to Codex

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copies `~/.codex/auth.json` (or `$CODEX_HOME/auth.json`) into the sandbox’s private home, so the agent uses your ChatGPT plan. API keys and other agents: [Authentication](../authentication/).

## Path A: generate a workflow project

Run `init` in your repository. `--yes` accepts the defaults: Codex, Docker, account sign-in, npm.

```sh
npx @elie-laloum/outpost init --image outpost:dev
npx @elie-laloum/outpost init --yes --install --image outpost:dev
```

`init` writes these files, then builds the image. It stops without writing anything if one already exists.

<!-- files -->

- `run.ts`: The workflow script (`run.mts` if `package.json` declares `"type": "commonjs"`).
- `brief.md`: The agent’s instructions, with an `{{OBJECTIVE}}` placeholder.
- `.env.example`: Variables your sign-in needs, none for a Codex account.
- `Dockerfile`: The [agent image](../agent-images/) recipe (`Containerfile` for Podman).
- `.gitignore`: Ignores `.env`, `node_modules/` and runtime directories; extends an existing one.
- `package.json`: Only when the directory has none.

`--no-build` skips the first build, which downloads the agent CLIs. Without `--install`, run `npm install`. `--directory` and `--repository` keep the workflow outside the checkout ([CLI commands](../cli/)).

## Path B: use Outpost in your application

```sh
npm install @elie-laloum/outpost
```

Path A already built `outpost:dev`. Otherwise, generate its recipe in a separate directory:

```sh
npx outpost init --yes --directory outpost-image --image outpost:dev
```

Save this configuration next to your scripts. Outpost does not load it by itself: import its names where you need them.

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

<!-- features -->

- `coder`: The Codex agent, signed in with your account.
- `sandboxProvider`: Starts a container from `outpost:dev` for each task.
- `repository`: The checkout to edit: `OUTPOST_REPOSITORY` (absolute path) or the current directory.

## Check the setup

```sh
npx outpost doctor --image outpost:dev
```

`doctor` checks the host, the container engine and the image, and exits with status 1 on failure. It does not test sign-in or model access; see [Diagnostics](../diagnostics/).

## Run the generated project

```sh
node run.ts "Describe this repository"
```

Progress goes to stderr, then the script prints the work branch, the agent’s commits and its conversation. Ctrl+C cancels and prints recovery details.

:::caution
The generated `run.ts` uses `branch: { mode: "integrate" }`: it merges the agent’s commits into your checked-out branch. To review first, use a named branch ([Repository and branch](../repository-and-branch/)).
:::

## Next

Run your own task from TypeScript in [Your first task](../first-request/).

API: [createAgent](../../reference/createagent/) · [createCodexHarness](../../reference/createcodexharness/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
