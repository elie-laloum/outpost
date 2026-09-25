---
title: "CliAgent"
description: "CliAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CliAgent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                   | Presence | Meaning                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli"`                                                                                | Required | Execution discriminator: cli.                                                                                                                  |
| `harness`               | `CliHarness`                                                                           | Required | CLI execution preset to bind to the selected model.                                                                                            |
| `model`                 | `string \| undefined`                                                                  | Optional | Nonempty model identifier forwarded unchanged; omission selects the native CLI default.                                                        |
| `authenticate`          | `((variables: Readonly<Record<string, string>>) => Command \| undefined) \| undefined` | Optional | Build an optional authentication command from explicitly resolved variables; reactivated when the selected configuration for this CLI changes. |
| `request`               | `(input: AgentInput) => Command`                                                       | Required | Build the executable, arguments and environment for the supplied agent input.                                                                  |
| `events`                | `(line: string) => readonly AgentEvent[]`                                              | Required | Decode one native CLI output line into normalized agent events.                                                                                |
| `name`                  | `string`                                                                               | Required | Native agent identifier used in execution events and diagnostics.                                                                              |
| `bootstrap`             | `string \| undefined`                                                                  | Optional | Shell recipe that installs the native CLI when bootstrapping is enabled.                                                                       |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                 | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                          |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                        | Optional | Explicit environment declarations; values are strings.                                                                                         |
| `conversations`         | `"codex" \| "claude" \| undefined`                                                     | Optional | Built-in native transcript format used when no custom storage is supplied.                                                                     |
| `storage`               | `ConversationStore \| undefined`                                                       | Optional | Custom conversation persistence implementation for this adapter.                                                                               |
| `capture`               | `boolean \| undefined`                                                                 | Optional | Whether the adapter enables native transcript capture.                                                                                         |
| `resumable`             | `boolean \| undefined`                                                                 | Optional | Whether the adapter supports native conversation continuation.                                                                                 |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                  | Optional | Parse a native transcript to recover token usage when available.                                                                               |

## Signature

```ts
export interface CliAgent extends AgentAdapter {
  readonly kind: "cli";
  readonly harness: CliHarness;
  readonly model?: string;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [CliHarness](../cliharness/)
