---
title: "createHarness"
description: "createHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose the built-in harness: Outpost runs the model loop itself, calling the model provider once per step and running tools through the borrowed sandbox. Options are validated immediately and unknown keys are rejected; nothing runs until an agent from createAgent({ harness, model }) is dispatched.

[Complete example and detailed rules](../../guide/harness/).

## Parameters and properties

| Name                    | Type                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `HarnessOptions`                                                   | Required | Settings of the built-in harness: model provider, instructions, tools, limits, tool execution, hooks, permissions, context strategy, skills, conversations, caching and MCP servers.                                                                                                        |
| `options.routing`       | `HarnessModelRouting \| undefined`                                 | Optional | Optional per-step routing declared with defineHarnessModelRouting; all candidates use this harness model provider.                                                                                                                                                                          |
| `options.modelProvider` | `ModelProvider`                                                    | Required | Model provider called for every step and summary request, such as createOpenAIModelProvider() or createAnthropicModelProvider(). Its validate() checks the agent model when createAgent() composes the agent.                                                                               |
| `options.instructions`  | `HarnessInstructionsOption \| undefined`                           | Optional | System instructions as text, a defineHarnessInstructions() or defineMcpPrompt() result, or a list of these. Resolved at each turn and joined with blank lines; empty results are skipped.                                                                                                   |
| `options.tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools and toolsets the model may call. Nested toolsets are flattened; names must be unique across the harness, including skill and MCP tools.                                                                                                                                               |
| `options.limits`        | `HarnessLimits \| undefined`                                       | Optional | Bounds per turn on steps, tool calls, delegation depth and token usage. Exceeding a bound fails with code limit.                                                                                                                                                                            |
| `options.toolExecution` | `HarnessToolExecution \| undefined`                                | Optional | Tool concurrency, per-call deadline and error policy.                                                                                                                                                                                                                                       |
| `options.hooks`         | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`            | Optional | Hooks from defineHarnessHook, run in declaration order within each phase.                                                                                                                                                                                                                   |
| `options.permissions`   | `HarnessPermissions \| undefined`                                  | Optional | Rules from defineHarnessPermissions(), evaluated before before-tool hooks. They also apply to every subagent's tool calls.                                                                                                                                                                  |
| `options.context`       | `HarnessContextStrategy \| undefined`                              | Optional | Strategy that can rewrite the history before each model request, such as truncateToolResults() or summarizeHistory().                                                                                                                                                                       |
| `options.conversations` | `false \| ConversationStore \| undefined`                          | Optional | Store for turn transcripts, default createHarnessConversations() under .outpost/conversations/harness in the repository. Wrap it with createTransportConversations() for remote storage; false disables capture, continuation and response repairs.                                         |
| `options.skills`        | `readonly HarnessSkill[] \| undefined`                             | Optional | Skills listed in the system instructions and loaded on demand through the load_skill tool; duplicate skill names are rejected.                                                                                                                                                              |
| `options.cache`         | `boolean \| undefined`                                             | Optional | Asks the model provider to cache the conversation prefix on each request, default true. The Anthropic provider marks the prefix for caching; OpenAI caches stable prefixes on its own.                                                                                                      |
| `options.mcpServers`    | `McpServers \| undefined`                                          | Optional | MCP servers keyed by name, started inside the borrowed sandbox for each turn; their tools appear as mcp__&lt;server>__&lt;tool>, plus resource and prompt tools when servers offer them. The lease must support liveInput, and oauth: "login" servers are rejected.                         |
| `options.profile`       | `AgentProfile \| undefined`                                        | Optional | Portable profile from defineAgentProfile(). Its instructions precede local instructions, its MCP servers merge with mcpServers without duplicate names, and its built-in tool policy intersects permissions, including after hooks and in descendants. It supplies no tool implementations. |

## Returns

`Harness`

## Signature

```ts
export declare function createHarness(options: HarnessOptions): Harness;
```

## Related contracts

- [Harness](../type-customharness/)
- [HarnessOptions](../customharnessoptions/)
