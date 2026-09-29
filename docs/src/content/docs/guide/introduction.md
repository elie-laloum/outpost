---
title: "Introduction"
description: "Outpost runs coding agents from your TypeScript code: any supported agent CLI or its own loop, in a sandbox you choose, on a Git branch you control. Their results become typed data that workflows can check, approve and resume."
---

## One task in code

`dispatch()` starts a sandbox, runs the agent on a branch, collects its commits and releases the sandbox.

The three imports come from the configuration written in [Setup](../setup/).

```ts title="fix.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

console.log(result.text); // the agent's final answer
console.log(result.commits.map((commit) => commit.subject)); // commits on outpost/fix-tests
console.log(result.usage); // input, cached and output token counts
```

## What you can build

<!-- features -->

- [Agent tasks](../briefs/): Brief an agent, pick its branch and get typed data back.
  - `dispatch()`
  - `createSandbox()`
- [Any coding agent](../choose-an-agent/): Five agent CLIs, signed in with your account or, for most, an API key.
  - Claude Code
  - Codex
  - Copilot CLI
  - Kimi Code
  - Antigravity
- [Your own agent loop](../harness/): Drive a model with your tools, permissions and subagents.
  - OpenAI
  - Anthropic
  - `createHarness()`
- [Any sandbox](../choose-a-sandbox/): Local containers, cloud sandboxes, a microVM or the host.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
- [MCP tools](../mcp-servers/): Give agents Model Context Protocol servers, secrets passed by name.
  - stdio
  - HTTP
  - OAuth
- [Isolation](../network-restrictions/): Restrict outbound traffic and keep Git metadata private.
  - egress rules
  - private Git
- [Typed workflows](../task-dependencies/): Tasks pass typed results, retry and loop until checks pass.
  - `defineWorkflow()`
  - `defineLoopTask()`
- [Durable runs](../durable-runs/): Checkpoint progress, pause on quotas, resume without redoing work.
  - checkpoints
  - quota pauses
  - cache
- [People in the loop](../approvals/): Wait for an approval or let the agent ask questions.
  - `defineApprovalTask()`
  - `defineInteractiveAgentTask()`
- [Unattended runs](../job-queues/): Run from CI, queues, cron schedules and verified webhooks.
  - SQLite
  - Redis
  - GitHub
  - GitLab
  - Slack
- [Observe and recover](../observability/): Journals, traces, offline replay and preserved work.
  - OpenTelemetry
  - replay
  - recovery
- [Extend Outpost](../integration-ports/): Plug in another agent CLI, sandbox or storage.
  - `AgentAdapter`
  - `SandboxProvider`
  - `Transport`

## Complete examples

<!-- features -->

- [Fix a failing CI build](../fix-failing-ci/): Loop until the test command passes.
- [Review a pull request on demand](../review-on-label/): Adding a label to a pull request starts a review.
- [Nightly maintenance](../nightly-maintenance/): A scheduled run that survives restarts and limits.
- [Change several repositories](../multi-repository-change/): One change, one sandbox per repository.
- [Let agents compete](../compete-agents/): Run several approaches, keep the one that passes.
- [Write a specification with a human](../specify-with-a-human/): Questions first, code after approval.

## Where to start

<!-- path -->

1. [How Outpost works](../how-it-works/): The agent, the sandbox and the workspace.
2. [Setup](../setup/): Install Outpost and write its configuration.
3. [Your first task](../first-request/): Run an agent and read its result.
4. [From a task to a workflow](../first-workflow/): Check, approve and resume.
