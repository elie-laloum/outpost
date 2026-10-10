---
title: "Install Outpost"
description: "Prepare the package, agent image and configuration for your first task."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="prepare-agent-access"></span>
<span id="create-your-configuration-file"></span>

## Before you start

This tutorial uses Codex in Docker to work on a Git repository. Prepare Node.js 24 or later, Git, a repository with at least one commit and a running Docker engine. Keep your scripts in that repository or in a separate directory.

## Install the package

Run these commands in the directory that will hold your scripts. The second command makes it an ESM project so Node.js can run the TypeScript examples directly. For an existing CommonJS project, use a separate script directory with its own package manifest.

```sh
npm install @elie-laloum/outpost
npm pkg set type=module
```

## Build the agent image

Build the tools once in a dedicated directory. The first build downloads the agent CLIs and can take several minutes.

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

Wait for the image build to succeed. `init` also creates example workflow files in `.outpost-image`; this tutorial uses the script you write next. To add project tools or use Podman, see [Build an agent image](../agent-images/).

## Prepare access to the agent

This configuration uses a Codex account login saved on your machine. Follow [Configure Codex](../codex/#sign-in-with-your-account) before running a task. For API-key access, use [Authentication](../authentication/); account and API access have separate billing.

## Save your configuration

Save `outpost.config.ts` next to your scripts. Replace the repository path with the absolute path to your checkout. The scripts import these values explicitly; no configuration discovery is required.

```ts title="outpost.config.ts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});
export const repository = "/absolute/path/to/your-repository";
```

Save each later code tab using its displayed filename, alongside this configuration unless the page says otherwise. Examples use `.ts` filenames and imports and run with Node.js 24+, without a compilation step.

## Check the image

Run the local checks before sending a model request:

```sh
npx outpost doctor --image outpost:dev
```

Fix any `FAIL` using [Troubleshoot your setup](../diagnostics/). `doctor` checks tools and the image, not your login or model access. You are ready to [run your first task](../first-request/) or [your first YAML recipe](../yaml-recipes/).
