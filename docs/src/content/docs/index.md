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
  secondary:
    { label: "See a complete workflow", href: "guide/development-workflow/" }
  story:
    label: "Example workflow"
    title: "From brief to commit, with every step explicit."
    steps:
      - title: "Define the work"
        text: "A repository, a brief and a branch for the task."
        role: "You"
        icon: "branch"
        href: "guide/repository-and-branch/"
      - title: "Run your agent"
        text: "Codex, Claude Code or another agent in your chosen sandbox."
        role: "Agent"
        icon: "agent"
        href: "guide/development-workflow/"
      - title: "Run your checks"
        text: "Your criteria decide what follows: fix, continue or stop."
        role: "Workflow"
        icon: "ci"
        href: "guide/verification-loops/"
      - title: "Review the commits"
        text: "You decide which changes to integrate."
        role: "You"
        icon: "branch"
        href: "guide/repository-and-branch/"
    result:
      label: "A branch for your review"
      branch: "outpost/fix-tests"
      text: "The fix and its commits, ready for review."
      href: "guide/repository-and-branch/"
    link: { label: "Build this workflow", href: "guide/development-workflow/" }
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
    text: "Choose your agents, coordinate their tasks and keep the results available for the next step. Each capability has its own guide."
    items:
      - title: "Agents and sandboxes"
        text: "Choose the coding agent independently of its execution environment: containers, cloud sandboxes or explicit local execution."
        href: "guide/choose-an-agent/"
      - title: "Git workspaces"
        text: "Give each task its own worktree, retain named branches and choose when to integrate the commits."
        href: "guide/repository-and-branch/"
      - title: "Typed workflows"
        text: "Connect task outputs with dependencies. Run independent tasks in parallel and pass typed values between steps."
        href: "guide/task-dependencies/"
      - title: "Validated responses"
        text: "Define the expected JSON schema, validate the answer and request repairs when an agent returns an invalid response."
        href: "guide/typed-responses/"
      - title: "Human decisions"
        text: "Pause for approval or let an agent ask questions. Save the answers before continuing the workflow."
        href: "guide/approvals/"
      - title: "Resumable runs"
        text: "Checkpoint finished tasks and cumulative usage. Resume a workflow with explicit recovery after an interruption."
        href: "guide/durable-runs/"
      - title: "Your own agent loop"
        text: "Compose a model provider, sandbox tools, MCP servers and bounded subagents with the built-in harness."
        href: "guide/harness/"
      - title: "Scheduled automation"
        text: "Publish jobs from schedules and verified webhooks. Workers execute the queued workflows."
        href: "guide/cron-schedules/"
      - title: "Usage and execution traces"
        text: "Follow events, read journals and export telemetry. Track reported tokens and set workflow budgets."
        href: "guide/observability/"
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

## One task now. A workflow when you need it.

Start by giving Codex a fix in its own Docker sandbox and Git workspace. Your current checkout stays available while the agent works. The named branch keeps the commits for review; this call does not integrate them.

Save these two files in your repository and run `node task.ts`. The reporter prints progress and token usage; `result` keeps the answer and commits available to your code. Use a new branch name for each task. Asking the agent to run tests is an instruction; the [verification loop](guide/verification-loops/) adds the check that decides whether to accept the work.

[Run your first task](guide/first-request/) to understand the result, then [compose a workflow](guide/first-workflow/) to connect it to the next step.

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
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  observe: createReporter(),
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

// Example output:
// [outpost · pass 1] running · codex
// Fixed the failing tests and committed the change.
// [outpost · pass 1] finished · 12.00s · status 0 · input 1200 · cache read 0 · cache write 0 · output 320
```

:::note[Before running the example]
Follow [Installation](guide/setup/) to build `outpost:dev`, prepare the agent's login and set `"type": "module"` in `package.json`. Node.js 24 runs these `.ts` files directly.
:::

## Deliver a CSV export, from ticket to branch

A ticket asks for a CSV export of the orders list. A planning agent identifies the files and expected behavior; a coding agent implements the change. Tests and a second agent's review run in parallel, then their results are collected. A failed check sends its findings back to the coding agent, within three attempts. Once both checks accept the work, the maintainer approves delivery.

<!-- canvas -->

- [**CSV export ticket**](guide/briefs/): Export the filtered orders, including dates and totals.
  - Maintainer
  - → **Plan the change**: brief
- [**Plan the change**](guide/typed-responses/): Identify the files, CSV format and edge cases to cover.
  - Agents
  - → **Implement the export**: validated plan
- [**Implement the export**](guide/sandbox-sessions/): Write the code and tests in a dedicated Git workspace.
  - Agents
  - → **Run the tests**: in parallel
  - → **Review the diff**: in parallel
- [**Run the tests**](guide/task-dependencies/): Run npm test; collect the exit status and failure output.
  - Checks
  - → **Collect the verdicts**: test result
- [**Review the diff**](guide/typed-responses/): A second agent checks the CSV format and returns a structured verdict.
  - Agents
  - → **Collect the verdicts**: review result
- [**Collect the verdicts**](guide/verification-loops/): Wait for both checks; accept or return their feedback.
  - Checks
  - → **Implement the export**: corrections · up to 3 attempts
  - → **Approve delivery**: tests and review accepted
  - → **Stop the run**: attempts exhausted
- [**Approve delivery**](guide/approvals/): Pause for the maintainer to review the proposed changes.
  - Maintainer
  - → **Prepare the branch**: approved
  - → **Stop the run**: rejected
- [**Prepare the branch**](guide/repository-and-branch/): Commit the accepted work on outpost/csv-export for integration.
  - Checks
- [**Stop the run**](guide/recovery/): Keep the workspace and findings available for investigation.
  - Checks

The dependencies join tests and review before the verdict. The correction loop reuses the workspace; the approval gate stores its pending decision in a checkpoint. Each arrow represents a step your TypeScript code controls.

<!-- features -->

- [**Feed failed checks into the next attempt**](guide/verification-loops/): Return test failures and review findings, with a fixed limit on rounds.
- [**Run independent checks together**](guide/concurrency-and-retries/): Declare dependencies and choose how many tasks can run at once.
- [**Approve delivery before continuing**](guide/approvals/): Persist the pending decision and resume with the maintainer's answer.

## Start with work already on your plate

You don't need a whole automation platform to get value from an agent. Start with a broken build, a review waiting for attention or maintenance that keeps slipping. These recipes show the agents, checks and results involved.

<!-- features -->

- [**Get a failing CI build moving again**](guide/fix-failing-ci/): Give an agent the failure, run the checks and feed back what still needs fixing.
- [**Get another pair of eyes on a pull request**](guide/review-on-label/): Queue a review from a label and receive a structured verdict your workflow can use.
- [**Give recurring maintenance a schedule**](guide/nightly-maintenance/): Run dependency updates on dated branches and collect a report.

## Keep your tools. Choose how they work together.

Use Codex for one task, Claude Code for another, or your own agent loop. Choose the execution environment independently. Your workflow is TypeScript you can read, version and extend alongside your project.

<!-- features -->

- [**Choose the agent for the job**](guide/choose-an-agent/): Compare Codex, Claude Code, Kimi Code, Copilot CLI and Antigravity.
- [**Run where it makes sense**](guide/choose-a-sandbox/): Choose Docker, Podman or a supported cloud sandbox.
- [**Build your own agent loop**](guide/harness/): Compose a model provider, sandbox tools and explicit limits.
