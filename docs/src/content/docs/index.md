---
title: "Outpost — Coding agents & TypeScript workflows"
description: "Run coding agents in sandboxes and compose typed TypeScript workflows. Outpost manages Git workspaces, checks, approvals and resumable agent tasks."
tableOfContents: false
head:
  - tag: title
    content: "Outpost — Coding agents & TypeScript workflows"
  - tag: meta
    attrs: { property: "og:type", content: "website" }
landing:
  category: "Coding agent orchestration in TypeScript"
  headline: ["Your agents.", "One TypeScript workflow."]
  lead: "Turn a brief into code, commits and a result you can check. Choose the agent and its sandbox. Connect tasks, tests and decisions in the code of your project."
  primary: { label: "Try it on your project", href: "guide/setup/" }
  secondary: { label: "Connect two tasks", href: "guide/first-workflow/" }
  story:
    label: "Example workflow"
    title: "From brief to commit, with every step explicit."
    steps:
      - title: "Define the work"
        text: "A repository, a brief and a branch for the task."
        role: "You"
        icon: "branch"
        href: "guide/git-workspaces/"
      - title: "Run your agent"
        text: "Codex, Claude Code or another agent in your chosen sandbox."
        role: "Agent"
        icon: "agent"
        href: "guide/first-workflow/"
      - title: "Run your checks"
        text: "Your criteria decide what follows: fix, continue or stop."
        role: "Workflow"
        icon: "ci"
        href: "guide/verification-loops/"
      - title: "Review the commits"
        text: "You decide which changes to integrate."
        role: "You"
        icon: "branch"
        href: "guide/git-workspaces/"
    result:
      label: "A branch for your review"
      branch: "outpost/fix-tests"
      text: "The fix and its commits, ready for review."
      href: "guide/git-workspaces/"
    link: { label: "Build this workflow", href: "guide/first-workflow/" }
  overview:
    - title: "Less setup around every task"
      text: "Let Outpost prepare the sandbox and Git workspace. Focus on the change."
      href: "guide/how-it-works/"
    - title: "Your checks set the standard"
      text: "Put tests and human approval between an agent's suggestion and your next step."
      href: "guide/approvals/"
    - title: "Work you can pick up again"
      text: "Checkpoint a workflow and resume it after an interruption."
      href: "guide/durable-runs/"
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
  capabilities:
    title: "What you can build with Outpost"
    text: "After your first task, choose the next problem you need to solve. These guides are independent paths."
    items:
      - title: "Agents and sandboxes"
        text: "Choose the coding agent independently of its execution environment: containers, cloud sandboxes or explicit local execution."
        href: "guide/choose-an-agent/"
      - title: "Typed workflows"
        text: "Connect task outputs with dependencies. Run independent tasks in parallel and pass typed values between steps."
        href: "guide/task-dependencies/"
      - title: "Resumable runs"
        text: "Checkpoint finished tasks and cumulative usage. Resume a workflow with explicit recovery after an interruption."
        href: "guide/durable-runs/"
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

<span id="one-task-now-a-workflow-when-you-need-it"></span>

Choose your starting point: [a TypeScript script](guide/setup/) or [your first YAML recipe](guide/yaml-recipes/). Both use the same agents and sandboxes.

## Run one task and read the answer

Ask an agent to review your README in its own Docker sandbox and Git workspace. Start with a repository containing a committed `README.md`; this example needs no failing tests or project-specific checks.

Follow [Installation](guide/setup/) to install the package, build `outpost:dev`, prepare the agent’s login and enable ESM. Save these two files at the repository root, then run `node task.ts` with Node.js 24 or later.

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
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review README.md for unclear instructions. Do not edit files.",
  },
});
console.log(result.text);
```

The script prints the agent’s review. No findings is also a valid result. The instruction asks for no edits; it is not a read-only permission. Inspect any commits on `outpost/readme-review` before integrating them, and use a fresh branch name for another task. [Your first task](guide/first-request/) walks through these checks.

<span id="deliver-a-csv-export-from-ticket-to-branch"></span>

## Connect the result to the next step

Once a task works, a workflow can pass its result to your own TypeScript code. Begin with two steps; add tests, approvals or retries when your task needs them.

<!-- canvas -->

- [**Review the README**](guide/first-request/): An agent returns its findings from a separate workspace.
  - Agent
  - → **Prepare a summary**: task result
- [**Prepare a summary**](guide/first-workflow/): Your TypeScript function selects the answer and branch.
  - Workflow
  - → **Inspect the result**: typed value
- [**Inspect the result**](guide/first-workflow/): Print the summary and decide what to do next.
  - You

Follow [Your first workflow](guide/first-workflow/) for the complete files and command. Prefer configuration files? [Run a first YAML recipe](guide/yaml-recipes/) reaches the same starting point.

<span id="start-with-work-already-on-your-plate"></span>

<span id="keep-your-tools-choose-how-they-work-together"></span>

## Choose your next task

These paths build on the first result; you can follow just the one you need.

<!-- features -->

- [**Check an agent’s work**](guide/verification-loops/): Run a real check and feed its failures into a bounded correction loop.
- [**Keep changes for review**](guide/git-workspaces/): Choose a branch and inspect its commits before integration.
- [**Get a structured answer**](guide/typed-responses/): Validate JSON before passing it to another task.
