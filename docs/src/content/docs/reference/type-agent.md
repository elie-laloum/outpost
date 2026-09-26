---
title: "Agent"
description: "Agent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Agent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                    | Type                                                                                   | Presence          | Meaning                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli" \| "custom"`                                                                    | Required          | Execution discriminator: cli or custom.                                                                                                        |
| `harness`               | `CliHarness \| CustomHarness`                                                          | Required          | Execution harness; its kind selects CLI supervision or a custom callback.                                                                      |
| `model`                 | `AgentModel \| undefined \| AgentModel`                                                | Variant-dependent | Normalized frozen AgentModel of the composed agent; absent when a CLI harness keeps its native default.                                        |
| `authenticate`          | `((variables: Readonly<Record<string, string>>) => Command \| undefined) \| undefined` | Variant-dependent | Build an optional authentication command from explicitly resolved variables; reactivated when the selected configuration for this CLI changes. |
| `request`               | `(input: AgentInput) => Command`                                                       | Variant-dependent | Build the executable, arguments and environment for the supplied agent input.                                                                  |
| `events`                | `(line: string) => readonly AgentEvent[]`                                              | Variant-dependent | Decode one native CLI output line into normalized agent events.                                                                                |
| `name`                  | `string`                                                                               | Required          | Native agent identifier used in execution events and diagnostics.                                                                              |
| `bootstrap`             | `string \| undefined`                                                                  | Optional          | Shell recipe that installs the native CLI when bootstrapping is enabled.                                                                       |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                 | Optional          | Require the native finished protocol event before treating an agent turn as complete.                                                          |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                        | Optional          | Explicit environment declarations; values are strings.                                                                                         |
| `conversations`         | `"codex" \| "claude" \| undefined`                                                     | Optional          | Built-in native transcript format used when no custom storage is supplied.                                                                     |
| `storage`               | `ConversationStore \| undefined`                                                       | Optional          | Custom conversation persistence implementation for this adapter.                                                                               |
| `capture`               | `boolean \| undefined \| boolean`                                                      | Variant-dependent | Whether the adapter enables native transcript capture.                                                                                         |
| `resumable`             | `boolean \| undefined \| boolean`                                                      | Variant-dependent | Whether the adapter supports native conversation continuation.                                                                                 |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                  | Optional          | Parse a native transcript to recover token usage when available.                                                                               |

## Signature

```ts
export type Agent = CliAgent | CustomAgent;
```

## Related contracts

- [CliAgent](../cliagent/)
- [CustomAgent](../customagent/)
