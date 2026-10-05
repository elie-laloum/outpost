---
title: "Installation"
description: "Install Outpost, build an agent image and create your TypeScript configuration."
---

## Before you start

You need Node.js 24 or later, Git, a repository with at least one commit and Docker running. This guide uses Codex; you can [choose another agent](../choose-an-agent/) later.

Run the following commands from the directory where you want to keep your scripts. This can be your repository or a separate directory.

## Install the package

Your scripts import the library from this package. The second command sets `"type": "module"` in the directory’s `package.json`, so Node.js can run the `.ts` examples as ESM modules. If your repository uses CommonJS, keep these scripts in a separate directory with its own `package.json`.

```sh
npm install @elie-laloum/outpost
npm pkg set type=module
```

The `outpost` command helps you build images and check your environment.

## Build the agent image

Generate and build the image in a dedicated directory:

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

The first build downloads the agent CLIs and may take a few minutes. Wait for it to finish before running a task.

Here, `init` prepares the image recipe and builds it. It also generates example workflow files in `.outpost-image`; the scripts in this guide are the ones you write yourself. You do not need to run the generated project.

You can edit `.outpost-image/Dockerfile` to add project tools, then rebuild with `npx outpost image build --directory .outpost-image --image outpost:dev`. See [Build an agent image](../agent-images/) for Podman and image customization.

## Prepare agent access

Before using the account-based configuration below, prepare a Codex login saved to a file on your machine. Follow [Configure Codex](../codex/#sign-in-with-your-account) for the login command and credential location.

For API-key access, or another agent, follow [Authentication](../authentication/). Account access and API access have separate billing.

## Create your configuration file

Save this file next to your scripts. It declares the agent, the image and the repository; your scripts import these values explicitly.

Also save `reporter.ts` beside your scripts. The examples import it to display results through `createReporter()`. `reportValue()` sends a text event to the reporter; `format()` keeps Node.js object formatting. To follow events during a task, pass `createReporter()` directly to `observe` ([follow progress](../progress/)). “Example output” comments illustrate a possible output; answers, identifiers and measurements vary between runs.

<!-- tabs -->

```ts title="outpost.config.ts"
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

```ts title="reporter.ts"
import { format } from "node:util";
import { createReporter } from "@elie-laloum/outpost";

const reporter = createReporter();
export function reportValue(...values: unknown[]) {
  reporter({ kind: "text", text: `${format(...values)}\n` });
}
```

`repository` uses the current directory unless you set `OUTPOST_REPOSITORY` to the absolute path of another checkout. If you keep your scripts outside the repository, set this variable before running them.

All TypeScript files in the guides use the `.ts` extension, including in their imports. Node.js 24 runs them directly; you do not need to compile them before execution.

The guides show longer examples as several files in tabs. Save each tab under its displayed filename, in the same directory as this configuration. The accompanying text names the script to run.

## Check the image

`doctor` checks the local tools and image. It does not send a model request or test your login. A failed check exits with status 1; [Troubleshoot your setup](../diagnostics/) explains the report.

```sh
npx outpost doctor --image outpost:dev
```

You are ready to [run your first task](../first-request/).
