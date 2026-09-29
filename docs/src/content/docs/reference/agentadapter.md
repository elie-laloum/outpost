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

| Name                    | Type                                                                                                   | Presence | Meaning                                                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fork`                  | `((id: string, invoke: (command: Command) => Promise<CommandResult>) => Promise<string>) \| undefined` | Optional | Optional native fork preparation: receive the parent ID and a borrowed sandbox command executor, then return a distinct child ID. Outpost requests continuation on that child; adapters with a fork flag can omit this hook.                                                                 |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined`                                              | Optional | Plan the credentials of this CLI from the resolved workflow variables, without disk access: variables to forward, host files to copy into the private sandbox home, generated files and login commands. Called once per adapter and sandbox; the local provider receives only the variables. |
| `request`               | `(input: AgentInput) => Command`                                                                       | Required | Build the executable, arguments and environment for the supplied agent input.                                                                                                                                                                                                                |
| `events`                | `(line: string) => readonly AgentEvent[]`                                                              | Required | Decode one native CLI output line into normalized agent events.                                                                                                                                                                                                                              |
| `quota`                 | `((text: string) => boolean) \| undefined`                                                             | Optional | Recognize a terminal usage-limit or rate-limit message in a failure event or stderr line. When the process then fails, the turn rejects with OutpostError code quota instead of process; transient retry notices must not match.                                                             |
| `unavailable`           | `((text: string) => boolean) \| undefined`                                                             | Optional | Recognize a terminal service outage or connection failure in a failure event or stderr line. When the process then fails without a quota signal, the turn keeps code process and records details.unavailable, read by unavailableFault(); retry notices must not match.                      |
| `usageCommand`          | `((conversation: string) => Command \| undefined) \| undefined`                                        | Optional | Build a bounded read-only command to collect counters for this conversation inside the borrowed sandbox; return undefined for an unsupported identifier.                                                                                                                                     |
| `usageResult`           | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optional | Decode the successful usage command’s stdout into session totals. Return undefined when unreadable, or complete: false for partial totals; do not return transcript content.                                                                                                                 |
| `name`                  | `string`                                                                                               | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                                                                  | Optional | Name of the built-in installer used to install a missing CLI on remote providers when bootstrapping is enabled: a pinned npm package for claude, codex, copilot and kimi, or a versioned archive with a pinned SHA-512 digest for antigravity.                                               |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                                 | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                                                                                                                                                                        |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`                                                  | Optional | CLI accounting capability: events expects usage in the decoded stream, session collects counters after exit, and unavailable declares that tokens cannot be measured. Omission preserves legacy adapter behavior.                                                                            |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                                        | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                       |
| `conversations`         | `"codex" \| "claude" \| "copilot" \| "kimi" \| undefined`                                              | Optional | Built-in native transcript format used when no custom storage is supplied.                                                                                                                                                                                                                   |
| `storage`               | `ConversationStore \| undefined`                                                                       | Optional | Custom conversation persistence implementation for this adapter.                                                                                                                                                                                                                             |
| `capture`               | `boolean \| undefined`                                                                                 | Optional | Whether the adapter enables native transcript capture.                                                                                                                                                                                                                                       |
| `resumable`             | `boolean \| undefined`                                                                                 | Optional | Whether the agent can continue a conversation, including response repair. Cold continuation additionally requires a conversation store; fork support is declared separately.                                                                                                                 |
| `forkable`              | `boolean \| undefined`                                                                                 | Optional | Whether conversation branching is supported; false rejects fork before allocation. Omitted preserves the adapter’s existing fork behavior. Resume support is declared separately.                                                                                                            |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optional | Parse a native transcript to recover token usage when available.                                                                                                                                                                                                                             |

## Signature

```ts
export interface AgentAdapter extends AgentFeatures {
  fork?(
    id: string,
    invoke: (command: Command) => Promise<CommandResult>,
  ): Promise<string>;
  credentials?(variables: Variables): CredentialPlan;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
  /** Recognizes a usage-limit or rate-limit message in failure or stderr text. */
  quota?(text: string): boolean;
  /** Recognizes a terminal service outage or connection failure in failure or stderr text. */
  unavailable?(text: string): boolean;
  usageCommand?(conversation: string): Command | undefined;
  usageResult?(text: string): Usage | undefined;
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [AgentFeatures](../support-agentfeatures/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [CredentialPlan](../support-credentialplan/)
- [Usage](../usage/)
- [Variables](../variables/)
