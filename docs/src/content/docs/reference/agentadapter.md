---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                      | Presence | Meaning                                                                                                                                                                                                                                                                                      |
| ----------------------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined` | Optional | Plan the credentials of this CLI from the resolved workflow variables, without disk access: variables to forward, host files to copy into the private sandbox home, generated files and login commands. Called once per adapter and sandbox; the local provider receives only the variables. |
| `request`               | `(input: AgentInput) => Command`                          | Required | Build the executable, arguments and environment for the supplied agent input.                                                                                                                                                                                                                |
| `events`                | `(line: string) => readonly AgentEvent[]`                 | Required | Decode one native CLI output line into normalized agent events.                                                                                                                                                                                                                              |
| `name`                  | `string`                                                  | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                     | Optional | Name of the built-in installer used to install a missing CLI on remote providers when bootstrapping is enabled: a pinned npm package for claude, codex, copilot and kimi, or the official, unpinned install script for antigravity.                                                          |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                                                                                                                                                                        |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                       |
| `conversations`         | `"codex" \| "claude" \| undefined`                        | Optional | Built-in native transcript format used when no custom storage is supplied.                                                                                                                                                                                                                   |
| `storage`               | `ConversationStore \| undefined`                          | Optional | Custom conversation persistence implementation for this adapter.                                                                                                                                                                                                                             |
| `capture`               | `boolean \| undefined`                                    | Optional | Whether the adapter enables native transcript capture.                                                                                                                                                                                                                                       |
| `resumable`             | `boolean \| undefined`                                    | Optional | Whether the adapter supports native conversation continuation.                                                                                                                                                                                                                               |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optional | Parse a native transcript to recover token usage when available.                                                                                                                                                                                                                             |

## Signature

```ts
export interface AgentAdapter extends AgentFeatures {
  credentials?(variables: Variables): CredentialPlan;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [AgentFeatures](../support-agentfeatures/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [CredentialPlan](../support-credentialplan/)
- [Variables](../variables/)
