---
title: "Introduction"
description: "Coding agents as part of your application."
---

Outpost is a TypeScript library for running coding agents against Git repositories. Give an agent a task, choose where it runs, and get back its answer, usage and commits.

Use it to automate a fix, review a change, or connect several steps into a workflow. Your application keeps control of branches, credentials and when changes are integrated.

## Start building

[Set up Outpost](../setup/) to configure an agent and its sandbox. Then [make your first request](../first-request/).

```sh
npm install @elie-laloum/outpost
```

## What you can build

| Need                                                  | Use                                        |
| ----------------------------------------------------- | ------------------------------------------ |
| Run a coding task                                     | [Requests](../first-request/)              |
| Test or inspect code between agent turns              | [Sandbox sessions](../sandbox-sessions/)   |
| Connect results and run independent work concurrently | [Task dependencies](../task-dependencies/) |
| Wait for a human decision                             | [Review gates](../review-gates/)           |
| Restart a workflow after interruption                 | [Durable runs](../durable-runs/)           |
| Keep reports across processes                         | [Shared artifacts](../shared-artifacts/)   |

## Choose the pieces independently

An **agent** selects a harness and optionally a model. A **sandbox provider** selects Docker, Podman, a cloud environment or the host. A **workspace** selects the Git checkout. Changing one does not require replacing the other two.

CLI harnesses support Codex, Claude Code, Antigravity, GitHub Copilot CLI and Kimi Code. You can also [configure Outpost’s own model loop](../model-loop/).

Outpost manages execution and state. Your tests establish whether a change works, and your code decides whether to integrate it. See [branch strategy](../branch-strategy/) before automating delivery.

## Read the API names

Function names tell you when work happens. `create*` builds an object you pass around, such as `createAgent()`, `createCodexHarness()` or `createLocalTransport()`; creating it starts no process. `define*` declares something an engine runs later, such as `defineWorkflow()`, `defineAgentTask()`, `defineJsonResponse()` or `defineHarnessTool()`. Verbs act immediately: `dispatch()`, `attach()`, `speculate()`, `readJournal()`.
