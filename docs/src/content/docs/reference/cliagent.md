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

| Name                    | Type                                                      | Presence | Meaning                                                                                                                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli"`                                                   | Required | Execution discriminator: cli.                                                                                                                                                                                                                                                                |
| `harness`               | `CliHarness`                                              | Required | CLI execution preset to bind to the selected model.                                                                                                                                                                                                                                          |
| `model`                 | `AgentModel \| undefined`                                 | Optional | Normalized frozen AgentModel bound to the CLI command; absent when the native CLI default is kept.                                                                                                                                                                                           |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined` | Optional | Plan the credentials of this CLI from the resolved workflow variables, without disk access: variables to forward, host files to copy into the private sandbox home, generated files and login commands. Called once per adapter and sandbox; the local provider receives only the variables. |
| `request`               | `(input: AgentInput) => Command`                          | Required | Build the executable, arguments and environment for the supplied agent input.                                                                                                                                                                                                                |
| `events`                | `(line: string) => readonly AgentEvent[]`                 | Required | Decode one native CLI output line into normalized agent events.                                                                                                                                                                                                                              |
| `name`                  | `string`                                                  | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                     | Optional | Name of the built-in installer used to install a missing CLI on remote providers when bootstrapping is enabled: a pinned npm package for claude, codex, copilot and kimi, or a versioned archive with a pinned SHA-512 digest for antigravity.                                               |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                                                                                                                                                                        |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                       |
| `conversations`         | `"codex" \| "claude" \| undefined`                        | Optional | Built-in native transcript format used when no custom storage is supplied.                                                                                                                                                                                                                   |
| `storage`               | `ConversationStore \| undefined`                          | Optional | Custom conversation persistence implementation for this adapter.                                                                                                                                                                                                                             |
| `capture`               | `boolean \| undefined`                                    | Optional | Whether the adapter enables native transcript capture.                                                                                                                                                                                                                                       |
| `resumable`             | `boolean \| undefined`                                    | Optional | Whether the adapter supports native conversation continuation.                                                                                                                                                                                                                               |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optional | Parse a native transcript to recover token usage when available.                                                                                                                                                                                                                             |

## Signature

```ts
export interface CliAgent extends AgentAdapter {
  readonly kind: "cli";
  readonly harness: CliHarness;
  readonly model?: AgentModel;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [AgentModel](../agentmodel/)
- [CliHarness](../cliharness/)
