---
title: "Choose an agent"
description: "Configure a coding agent and compare the settings and conversation features it supports."
---

## The agents

An agent combines a harness with an optional model selection. The harness runs the agent’s loop: it can use an installed CLI, such as Codex or Claude Code, or Outpost’s built-in loop. Pick the agent first, then configure its access and model.

<!-- features -->

- [Claude Code](../claude-code/): Anthropic’s coding CLI, with live steering and the widest model settings.
  - account
  - token
  - API key
- [Codex](../codex/): OpenAI’s coding CLI, with live steering and custom Responses-compatible providers.
  - account
  - API key
- [GitHub Copilot CLI](../copilot-cli/): GitHub’s coding CLI, billed to your Copilot plan; it resumes but does not fork.
  - account
  - token
- [Kimi Code](../kimi-code/): Moonshot AI’s coding CLI; with an API key, you must name the model.
  - account
  - API key
  - model required with API key
- [Antigravity](../antigravity/): Google’s `agy` CLI; its conversations continue only in their open sandbox.
  - account
  - API key
- [Built-in harness](../harness/): Outpost’s own loop, running your tools over an OpenAI or Anthropic API.
  - API key
  - model required

## Compose an agent

Pass a harness to `createAgent()`, then add `model` if you want to override the agent’s default. Outpost provides a harness constructor for each supported CLI: `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` and `createAntigravityHarness()`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
  model: { name: "opus", reasoning: "high" },
});
```

Pass the agent to `dispatch()` as `agent`. `authentication` chooses between your account and an API key; see [Authentication](../authentication/).

## Select a model

API reference: [ModelSpec](../../reference/modelspec/) and [AgentModel](../../reference/agentmodel/).

`createAgent()` rejects model settings the harness cannot apply, including unsupported `reasoning` levels or `maxOutputTokens`. This check happens before execution. The model service checks your account’s access when the request runs; the API reference below describes the supported settings.

API reference: [ModelSpec](../../reference/modelspec/) and [AgentModel](../../reference/agentmodel/).

## Compare capabilities

### Sign in

Choose the credential you already have. [Authentication](../authentication/) explains how to pass it to the sandbox and how account access differs from API billing.

| Agent                           | Account login | Account token in a variable | API key                     |
| ------------------------------- | ------------- | --------------------------- | --------------------------- |
| [Claude Code](../claude-code/)  | Yes           | Yes                         | Yes                         |
| [Codex](../codex/)              | Yes           | No                          | Yes                         |
| [Copilot CLI](../copilot-cli/)  | Yes           | Yes                         | No                          |
| [Kimi Code](../kimi-code/)      | Yes           | No                          | Yes, with an explicit model |
| [Antigravity](../antigravity/)  | Yes           | No                          | Yes                         |
| [Built-in harness](../harness/) | No            | No                          | Yes                         |

### Continue work

Every agent can continue a conversation while its sandbox remains open. To resume in a new sandbox, Outpost also needs to capture and restore that conversation. A fork starts a separate conversation from the same context.

| Agent            | Resume in a new sandbox | Fork | Steering mode |
| ---------------- | ----------------------- | ---- | ------------- |
| Claude Code      | Yes                     | Yes  | `injected`    |
| Codex            | Yes                     | Yes  | `injected`    |
| Copilot CLI      | Yes                     | No   | `resumed`     |
| Kimi Code        | Yes                     | Yes  | `resumed`     |
| Antigravity      | No                      | No   | `resumed`     |
| Built-in harness | Yes                     | Yes  | `injected`    |

With `injected`, new instructions reach the running turn. With `resumed`, Outpost stops the turn and resumes its conversation. See [steering](../steering/) to send instructions and [conversations](../conversations/) to resume or fork.

All these agents support [response repairs](../typed-responses/) when conversation continuation is enabled. Setting `saveConversations: false` on Claude Code or Codex keeps only continuation in the same sandbox. Setting `conversations: false` on the built-in harness disables continuation, forks and repairs.

For progress events and token counters, see [progress reporting](../progress/) and [budgets](../budgets/). Quota reset times depend on the agent or model provider; [quota pauses](../quota-pauses/) explains when a workflow can wait automatically.

## Give agents MCP tools

Every harness accepts `mcpServers`: stdio commands or HTTP endpoints, with secrets passed by variable name. [MCP servers](../mcp-servers/) shows how to declare them.

For OAuth, Claude Code, Codex and Kimi can use a login saved on the host; the built-in harness uses client credentials. Copilot CLI and Antigravity do not support this OAuth configuration. See [MCP server login](../mcp-oauth/).

## Fall back to another agent

`createFallbackAgent([...], { on })` hands a dispatch to the next candidate when a usage limit or an outage stops the current one. See [Fallback agents](../fallback-agents/).

## Run without a CLI

`createHarness()` drives a model API directly, with the tools, permissions and subagents you declare. It installs no CLI and requires a [model provider](../model-providers/). See [Built-in harness](../harness/).

API: [createAgent](../../reference/createagent/) · [AgentOptions](../../reference/agentoptions/) · [ModelSpec](../../reference/modelspec/) · [AgentModel](../../reference/agentmodel/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createCodexHarness](../../reference/createcodexharness/) · [createCopilotHarness](../../reference/createcopilotharness/) · [createKimiHarness](../../reference/createkimiharness/) · [createAntigravityHarness](../../reference/createantigravityharness/) · [createHarness](../../reference/createharness/) · [createFallbackAgent](../../reference/createfallbackagent/).
