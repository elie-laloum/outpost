---
title: "HarnessOptions"
description: "HarnessOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routing`       | `HarnessModelRouting \| undefined`                                 | Optional | Optional per-step routing declared with defineHarnessModelRouting; all candidates use this harness model provider.                                                                                                                                                                          |
| `modelProvider` | `ModelProvider`                                                    | Required | Model provider called for every step and summary request, such as createOpenAIModelProvider() or createAnthropicModelProvider(). Its validate() checks the agent model when createAgent() composes the agent.                                                                               |
| `instructions`  | `HarnessInstructionsOption \| undefined`                           | Optional | System instructions as text, a defineHarnessInstructions() or defineMcpPrompt() result, or a list of these. Resolved at each turn and joined with blank lines; empty results are skipped.                                                                                                   |
| `tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools and toolsets the model may call. Nested toolsets are flattened; names must be unique across the harness, including skill and MCP tools.                                                                                                                                               |
| `limits`        | `HarnessLimits \| undefined`                                       | Optional | Bounds per turn on steps, tool calls, delegation depth and token usage. Exceeding a bound fails with code limit.                                                                                                                                                                            |
| `toolExecution` | `HarnessToolExecution \| undefined`                                | Optional | Tool concurrency, per-call deadline and error policy.                                                                                                                                                                                                                                       |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`            | Optional | Hooks from defineHarnessHook, run in declaration order within each phase.                                                                                                                                                                                                                   |
| `permissions`   | `HarnessPermissions \| undefined`                                  | Optional | Rules from defineHarnessPermissions(), evaluated before before-tool hooks. They also apply to every subagent's tool calls.                                                                                                                                                                  |
| `context`       | `HarnessContextStrategy \| undefined`                              | Optional | Strategy that can rewrite the history before each model request, such as truncateToolResults() or summarizeHistory().                                                                                                                                                                       |
| `conversations` | `false \| ConversationStore \| undefined`                          | Optional | Store for turn transcripts, default createHarnessConversations() under .outpost/conversations/harness in the repository. Wrap it with createTransportConversations() for remote storage; false disables capture, continuation and response repairs.                                         |
| `skills`        | `readonly HarnessSkill[] \| undefined`                             | Optional | Skills listed in the system instructions and loaded on demand through the load_skill tool; duplicate skill names are rejected.                                                                                                                                                              |
| `cache`         | `boolean \| undefined`                                             | Optional | Asks the model provider to cache the conversation prefix on each request, default true. The Anthropic provider marks the prefix for caching; OpenAI caches stable prefixes on its own.                                                                                                      |
| `mcpServers`    | `McpServers \| undefined`                                          | Optional | MCP servers keyed by name, started inside the borrowed sandbox for each turn; their tools appear as mcp__&lt;server>__&lt;tool>, plus resource and prompt tools when servers offer them. The lease must support liveInput, and oauth: "login" servers are rejected.                         |
| `profile`       | `AgentProfile \| undefined`                                        | Optional | Portable profile from defineAgentProfile(). Its instructions precede local instructions, its MCP servers merge with mcpServers without duplicate names, and its built-in tool policy intersects permissions, including after hooks and in descendants. It supplies no tool implementations. |

## Signature

```ts
export interface HarnessOptions {
  readonly routing?: HarnessModelRouting;
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly hooks?: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills?: readonly HarnessSkill[];
  readonly cache?: boolean;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
```

## Related contracts

- [AgentProfile](../agentprofile/)
- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructionsOption](../harnessinstructionsoption/)
- [HarnessLimits](../harnesslimits/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [HarnessToolset](../harnesstoolset/)
- [McpServers](../mcpservers/)
- [ModelProvider](../modelprovider/)
