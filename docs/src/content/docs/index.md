---
title: Outpost
description: "Turn fixes, code reviews and maintenance into repeatable agent workflows. Outpost manages sandboxes and Git workspaces; you build the steps, checks and approvals in TypeScript."
tableOfContents: false
landing:
  category: "Coding agent orchestration, in TypeScript"
  headline: ["Your agents write code.", "You stay in control."]
  lead: "Turn fixes, code reviews and maintenance into repeatable workflows. Outpost handles agent sandboxes and Git workspaces; you connect the steps, checks and approvals in TypeScript."
  primary: { label: "Run your first task", href: "guide/setup/" }
  secondary: { label: "Explore the API", href: "reference/" }
  overview:
    - title: "The agents you already use"
      text: "Work with Codex, Claude Code or another supported agent. Choose the right one for each task."
      href: "guide/choose-an-agent/"
    - title: "The environment that fits"
      text: "Run tasks in Docker, Podman or a supported cloud sandbox."
      href: "guide/choose-a-sandbox/"
    - title: "Changes you can review"
      text: "Get a Git branch, the agent’s commits and its answer. Decide what to integrate."
      href: "guide/repository-and-branch/"
  install:
    managers: "Package manager"
    commands:
      - { label: "npm", command: "npm install @elie-laloum/outpost" }
      - { label: "yarn", command: "yarn add @elie-laloum/outpost" }
      - { label: "bun", command: "bun add @elie-laloum/outpost" }
      - { label: "pnpm", command: "pnpm add @elie-laloum/outpost" }
    copy: "Copy the install command"
    copied: "Copied"
    failed: "Copy failed. Select the command to copy it."
    prerequisites: "Node.js 24+ · Git · Docker for the example below"
  next:
    title: "Give your next task to an agent."
    text: "Install Outpost, build your image and run a first fix from a TypeScript script."
    guide: { label: "Run your first task", href: "guide/setup/" }
    reference: { label: "Explore the API", href: "reference/" }
  footer:
    documentation:
      title: "Documentation"
      links:
        - { label: "Guide", href: "guide/introduction/" }
        - { label: "API", href: "reference/" }
    source:
      title: "Project"
      links:
        - {
            label: "GitLab",
            href: "https://gitlab.elielaloum.com/elielaloum/outpost",
          }
        - { label: "GitHub", href: "https://github.com/elie-laloum/outpost" }
        - {
            label: "npm",
            href: "https://www.npmjs.com/package/@elie-laloum/outpost",
          }
    license: "MIT license"
---

## Your first fix, in two TypeScript files

Give Codex the failing tests and ask it to make a fix. Outpost prepares its workspace in a Docker sandbox and keeps its commits on a separate branch. You can carry on working in your current checkout while the agent works on its task.

Save both files in your repository. Run `node task.ts`, then review the answer and commits on the returned branch. Use a new branch name for each independent task.

[Your first task](guide/first-request/) explains the result. The [API](reference/dispatch/) describes the full contract.

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
export const repository = process.cwd();
```

```ts title="task.ts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

console.log(result.text);
console.log(result.branch, result.commits);
```

:::note[Before running the example]
Follow [Installation](guide/setup/) to build `outpost:dev`, prepare the agent’s login and set `"type": "module"` in your `package.json`. Node.js 24 runs these `.ts` files directly.
:::

## Every task gets its own workspace

Outpost takes care of preparing the Git workspace, opening the sandbox and running the agent. When `dispatch()` finishes, it closes the sandbox it opened. You keep the named branch and its commits, ready to review and integrate when you choose.

<!-- canvas -->

- **Your request**: Choose the agent, repository and sandbox in TypeScript.
  - Task
  - → **Workspace and sandbox**: prepare
- **Workspace and sandbox**: Outpost creates the working checkout and opens the execution environment.
  - Task
  - → **Agent at work**: run
- **Agent at work**: The agent reads the brief, edits files and runs commands.
  - Task
  - → **Result to review**: collect
- **Result to review**: Read the answer, commits and usage. Decide what to integrate.
  - Task

The agent’s instructions do not enforce a successful test run. Add a [verification step](guide/verification-loops/) when passing checks must determine whether the work is accepted. [How Outpost runs a task](guide/how-it-works/) explains resource ownership.

## Make agents part of how you work

Keep using a supported CLI you know, try a different agent for a particular task, or build your own loop with the Outpost harness. Choose where it runs independently. Each provider’s guide helps you find the right environment and prepare it.

<!-- features -->

- [**Coding agents**](guide/choose-an-agent/): Configure Codex, Claude Code, Kimi Code, Copilot CLI or Antigravity.
- [**Sandboxes**](guide/choose-a-sandbox/): Choose local containers or a supported cloud provider for your task.
- [**Your own agent loop**](guide/harness/): Combine a model provider, sandbox tools and explicit limits.

## Automate the work that keeps coming back

A failing CI build, a pull request to review, dependencies to update: turn recurring work into a workflow you can run again. Connect tasks, run independent steps in parallel and decide where checks and human approval belong. The [first workflow](guide/first-workflow/) guide shows how to build on one agent task.

Start with a workflow for the work on your team’s plate:

<!-- features -->

- [**Fix a failing CI build**](guide/fix-failing-ci/): Feed test failures back to an agent and check each new attempt.
- [**Review a pull request**](guide/review-on-label/): Queue a review from a pull request label and receive a typed verdict.
- [**Run nightly maintenance**](guide/nightly-maintenance/): Schedule dependency updates on dated branches and collect a report.

Add [typed responses](guide/typed-responses/) when another task needs structured data, [approval gates](guide/approvals/) when a step needs a person’s decision, or [durable runs](guide/durable-runs/) when the workflow must resume after an interruption.
