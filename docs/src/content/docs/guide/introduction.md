---
title: "Introduction"
description: "Run coding agents from TypeScript, in a sandbox and on a branch you choose, and compose their work into workflows."
---

Outpost is a TypeScript library and CLI that runs coding-agent CLIs (Claude Code, Codex, GitHub Copilot CLI, Kimi Code, Antigravity) or its own built-in harness. Each agent works inside a sandbox you choose (Docker, Podman, Vercel, Daytona, Firecracker or the host) on a Git workspace you control. Outpost then composes their results into typed workflows that survive interruptions.

Use it to automate agent work from your own code: you decide which credentials the agent receives, which branch it writes to and when its commits are integrated.

## One task in code

`dispatch()` starts a sandbox, runs the agent on a branch, collects its commits and releases the sandbox. `coder`, `repository` and `sandboxProvider` come from the configuration file created in [Setup](../setup/).

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

### Run an agent task

- Describe the work with text, files and variables: [Write a brief](../briefs/).
- Choose the checkout and where commits land: [Repository and branch](../repository-and-branch/).
- Get validated data instead of free text: [Typed responses](../typed-responses/).
- Run tests between agent turns in a prepared environment: [Sandbox sessions](../sandbox-sessions/), [Prepare the environment](../environment-setup/).
- Continue or fork an agent's conversation: [Conversations](../conversations/).
- Bound, cancel, redirect and follow a running agent: [Limits and cancellation](../limits-and-cancellation/), [Steering](../steering/), [Follow progress](../progress/).

### Choose agents and sandboxes

- Pick a CLI agent and how it authenticates: [Choose an agent](../choose-an-agent/), [Authentication](../authentication/).
- Give agents Model Context Protocol tools, including servers behind a login: [MCP servers](../mcp-servers/), [MCP server login](../mcp-oauth/).
- Hand a task to another agent when the first hits a limit or goes down: [Fallback agents](../fallback-agents/).
- Drive OpenAI or Anthropic models with Outpost's own loop, tools, permissions and subagents: [Built-in harness](../harness/).
- Pick where commands run: [Choose a sandbox](../choose-a-sandbox/), then [Docker and Podman](../containers/), [Cloud sandboxes](../cloud-sandboxes/), [Firecracker microVMs](../firecracker/) or [Host execution](../host-process/).
- Control what a sandbox receives: [Agent images](../agent-images/), [Environment variables](../environment-variables/), [Network restrictions](../network-restrictions/), [Private Git](../private-git/).

### Compose workflows

- Connect typed tasks into a graph that runs independent work in parallel: [Tasks and dependencies](../task-dependencies/), [Concurrency, retries and timeouts](../concurrency-and-retries/).
- Repeat work until a check accepts it: [Verification loops](../verification-loops/).
- Change several repositories, each in its own sandbox: [Multiple repositories](../multiple-repositories/).
- Run competing candidates and keep the one that passes: [Competing candidates](../speculation/).
- Cap attempts and tokens, and reuse results whose inputs did not change: [Budgets](../budgets/), [Result cache](../task-cache/).
- Share typed results across processes: [Artifacts](../artifacts/).

### Run durably and involve people

- Resume a workflow after a crash without repeating finished tasks: [Durable runs](../durable-runs/).
- Pause on a usage limit and resume after the reset: [Quota pauses](../quota-pauses/).
- Wait for a human decision, or let the agent ask questions: [Approvals](../approvals/), [Interactive tasks](../interactive-tasks/).

### Run unattended

- Run in a CI pipeline: [Run in CI](../ci-automation/).
- Execute jobs through a durable queue and workers: [Job queues and workers](../job-queues/), [Redis and BullMQ](../redis-workers/).
- Start workflows on a schedule or from a webhook: [Cron schedules](../cron-schedules/), [Webhooks](../webhooks/).

### Store, observe and operate

- Keep durable data on disk or in S3 and R2: [Where data lives](../storage/), [S3 and R2](../object-storage/).
- Record each dispatch, export traces and replay a run without a model: [Journals](../journals/), [Observation hub and OpenTelemetry](../observability/), [Replay without a model](../record-replay/).
- Check prerequisites, handle errors and recover preserved work: [Diagnostics](../diagnostics/), [Errors](../error-handling/), [Recover work](../recovery/).
- Clean up, review exposure and use the CLI: [Retention and cleanup](../retention/), [Security](../security/), [CLI commands](../cli/).

### Extend Outpost

- Extend one capability without replacing the runtime, or connect another agent CLI or execution environment: [Integration ports](../integration-ports/), [Add a CLI agent](../custom-agents/), [Native conversation formats](../conversation-formats/), [Add a sandbox provider](../custom-sandbox-providers/).

### Complete examples

[Fix a failing CI build](../fix-failing-ci/) · [Review a pull request on demand](../review-on-label/) · [Nightly maintenance](../nightly-maintenance/) · [Change several repositories](../multi-repository-change/) · [Let agents compete](../compete-agents/) · [Write a specification with a human](../specify-with-a-human/)

## Where to start

1. [How Outpost works](../how-it-works/) explains the agent, the sandbox and the workspace, and who owns each.
2. [Setup](../setup/) installs Outpost, builds an image and creates `outpost.config.mts`.
3. [Your first task](../first-request/) runs one task and reads its answer, usage and commits.
4. [From a task to a workflow](../first-workflow/) turns that task into a checked, approved and resumable workflow.
