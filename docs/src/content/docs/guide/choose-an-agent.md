---
title: "Choose an agent"
description: "Compare the five agent CLIs and the built-in harness, then compose an agent with the model you want."
---

## The agents

An agent pairs a harness with a model. A harness is what drives the model: one of five coding-agent CLIs installed in the sandbox, or Outpost’s own loop.

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
  - `createHarness()`

## Compose an agent

`createAgent()` takes a harness and an optional model. Each CLI has a preset: `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` and `createAntigravityHarness()`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
  model: { name: "opus", reasoning: "high" },
});
```

Pass the agent to `dispatch()` as `agent`. `authentication` chooses between your account and an API key; see [Authentication](../authentication/).

## Select a model

`model` is a name (`"opus"`) or an object `{ name, reasoning, maxOutputTokens }`. Omit it to use the CLI’s default model. The built-in harness has no default and requires one.

The harness checks the settings when you call `createAgent()`: a `reasoning` level or `maxOutputTokens` it cannot apply throws there, before any run. Whether your account can use the model is decided by the service, at run time. The table below lists which settings each agent accepts.

## Compare capabilities

| Capability                                      | [Claude Code](../claude-code/) | [Codex](../codex/) | [Copilot CLI](../copilot-cli/) | [Kimi Code](../kimi-code/) | [Antigravity](../antigravity/) | [Built-in harness](../harness/)     |
| ----------------------------------------------- | ------------------------------ | ------------------ | ------------------------------ | -------------------------- | ------------------------------ | ----------------------------------- |
| [Account login](../authentication/)             | Yes                            | Yes                | Yes                            | Yes                        | Yes                            | No                                  |
| [Account token variable](../authentication/)    | Yes                            | No                 | Yes                            | No                         | No                             | No                                  |
| [API key](../authentication/)                   | Yes                            | Yes                | No                             | Yes, with a model          | Yes                            | Yes                                 |
| Model `reasoning`                               | `low` to `max`                 | `low` to `max`     | No                             | No                         | No                             | [Per provider](../model-providers/) |
| Model `maxOutputTokens`                         | Yes                            | No                 | No                             | No                         | No                             | [Per provider](../model-providers/) |
| [Conversation capture](../conversations/)       | Yes                            | Yes                | Yes                            | Yes                        | No                             | Yes                                 |
| [Warm resume](../conversations/) (same sandbox) | Yes                            | Yes                | Yes                            | Yes                        | Yes                            | Yes                                 |
| [Cold resume](../conversations/) (new sandbox)  | Yes                            | Yes                | Yes                            | Yes                        | No                             | Yes                                 |
| [Fork](../conversations/)                       | Yes                            | Yes                | No                             | Yes                        | No                             | Yes                                 |
| [Response repair](../typed-responses/)          | Yes                            | Yes                | Yes                            | Yes                        | Yes                            | Yes                                 |
| [Steering](../steering/)                        | `injected`                     | `injected`         | `resumed`                      | `resumed`                  | `resumed`                      | `injected`                          |
| [MCP servers](../mcp-servers/)                  | Yes                            | Yes                | Yes                            | Yes                        | Yes                            | Yes                                 |
| [MCP OAuth](../mcp-oauth/)                      | Host login                     | Host login         | No                             | Host login                 | No                             | Client credentials                  |
| [Usage reporting](../budgets/)                  | End of turn                    | End of turn        | Each message, total after exit | After exit                 | End of turn                    | Each model response                 |
| [Quota reset time](../quota-pauses/)            | When reported                  | No                 | No                             | No                         | No                             | From `Retry-After`                  |

<!-- features -->

- **Capture**: `saveConversations: false` on Claude Code or Codex leaves only warm resume; `conversations: false` on the built-in harness removes resume, fork and repair.
  - `saveConversations`
  - `conversations`
- **Repair**: `dispatch()` refuses `repairs` above 0 for an agent that cannot continue its conversation.
  - `repairs`
- **Usage**: `usage.complete === false` marks the counters as a lower bound; Kimi counters arrive only after the CLI exits.
  - `usage.complete`

## Give agents MCP tools

Every harness accepts `mcpServers`: stdio commands or HTTP endpoints, with secrets passed by variable name. See [MCP servers](../mcp-servers/) and [MCP server login](../mcp-oauth/).

## Fall back to another agent

`createFallbackAgent([...], { on })` hands a dispatch to the next candidate when a usage limit or an outage stops the current one. See [Fallback agents](../fallback-agents/).

## Run without a CLI

`createHarness()` drives a model API directly, with the tools, permissions and subagents you declare. It installs no CLI and requires a [model provider](../model-providers/). See [Built-in harness](../harness/).

API: [createAgent](../../reference/createagent/) · [AgentOptions](../../reference/agentoptions/) · [ModelSpec](../../reference/modelspec/) · [AgentModel](../../reference/agentmodel/) · [createClaudeHarness](../../reference/createclaudeharness/) · [createCodexHarness](../../reference/createcodexharness/) · [createCopilotHarness](../../reference/createcopilotharness/) · [createKimiHarness](../../reference/createkimiharness/) · [createAntigravityHarness](../../reference/createantigravityharness/) · [createHarness](../../reference/createharness/) · [createFallbackAgent](../../reference/createfallbackagent/).
