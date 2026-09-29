---
title: "Setup"
description: "Install Outpost and configure your first agent."
---

Use Node.js 24 or later and a Git repository with at least one commit. This setup uses Docker and a Codex account. Choose another [CLI harness](../agent-config/) or [execution backend](../execution-backends/) if needed.

## Install

```sh
npm install @elie-laloum/outpost
```

## Prepare the image

Start Docker, then generate the workflow files and build the image from your repository:

```sh
npx outpost init --yes --image outpost:dev --install
```

The first build downloads the CLI tools. `--no-build` skips it when the image already exists. Existing package manifests are preserved.

## Sign in

Sign in on the host with the Codex CLI, using file credential storage:

```sh
npm install -g @openai/codex
codex -c cli_auth_credentials_store='"file"' login
```

Outpost copies the login into the sandbox’s private home. It never reads a system keychain. For an API key, use the [API authentication configuration](../access-credentials/).

## Create the configuration

Save this file next to your workflow script. Set `OUTPOST_REPOSITORY` to an absolute checkout path when running outside the target repository.

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

This file is ordinary application code. Outpost does not discover it automatically; import the settings into each script that uses them.

## Send a request

Continue with [First request](../first-request/). To use the generated CLI project immediately, run `node run.ts "Describe this repository"` (`run.mts` in an explicit CommonJS project).

API: [createAgent](../../reference/createagent/) · [createDockerSandboxProvider](../../reference/createdockersandboxprovider/).
