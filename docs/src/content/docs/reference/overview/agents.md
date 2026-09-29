---
title: "Agents — Overview"
description: "Compose a harness and a model into an agent, or order several agents into a fallback agent for dispatch."
sidebar:
  label: Overview
  order: 0
---

## Model settings by harness

`createAgent({ harness, model })` starts nothing. It checks `reasoning` and `maxOutputTokens` against the harness and throws code `configuration` for a setting the harness cannot apply.

| Harness                              | `model` omitted                                   | `reasoning`               | `maxOutputTokens`                       |
| ------------------------------------ | ------------------------------------------------- | ------------------------- | --------------------------------------- |
| Claude Code                          | CLI default                                       | `low` to `max`            | Sent as `CLAUDE_CODE_MAX_OUTPUT_TOKENS` |
| Codex                                | CLI default                                       | `low` to `max`            | Rejected                                |
| Copilot CLI, Antigravity             | CLI default                                       | Rejected                  | Rejected                                |
| Kimi Code                            | CLI default; a name is required with `usage` auth | Rejected                  | Rejected                                |
| Built-in harness, OpenAI provider    | Rejected                                          | Any level, sent unchanged | Sent with each request                  |
| Built-in harness, Anthropic provider | Rejected                                          | `none`, `low` to `max`    | Required                                |

## When a fallback agent moves on

`createFallbackAgent([first, second], { on })` runs its candidates in order in one sandbox and workspace, without reset. Each next candidate restarts from the original brief on the work already there.

| Failure of the current candidate                            | Outcome                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Code `quota`, with `quota` in `on`                          | Next candidate; the attempt is recorded in `result.fallback.attempts`                                         |
| Outage found by `unavailableFault()`, `unavailable` in `on` | Next candidate; the error keeps its code (`process` or `provider`)                                            |
| `timeout` after the agent reported a connection failure     | Counted as an outage, so `unavailable` in `on` moves to the next candidate                                    |
| Cancellation, other timeouts, any other failure             | Rethrown at once, with earlier attempts in `recovery.fallback`                                                |
| Covered failure on the last candidate                       | Rethrown the same way; if every candidate hit a quota, one `quota` error with the earliest reported `resetAt` |

:::note
A fallback agent cannot take `continuation` or be attached. Continue with `result.resume()` or `result.fork()`, which use the selected candidate.
:::

## Entry points

Guide: [Choose an agent](../../../guide/choose-an-agent/) · [Fallback agents](../../../guide/fallback-agents/) · [Model providers](../../../guide/model-providers/)

- [createAgent](../../createagent/)
- [createFallbackAgent](../../createfallbackagent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [AgentModel](../../agentmodel/)
- [ModelReasoning](../../modelreasoning/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [FallbackAgent](../../type-fallbackagent/)
- [FallbackRecord](../../fallbackrecord/)
- [FallbackAttempt](../../fallbackattempt/)
