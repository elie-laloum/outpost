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
| `configuration`         | `((variables: Variables) => AgentConfiguration) \| undefined`                                          | Optional | Plan CLI configuration from the resolved variables, without disk access: files to merge and host files to copy into the agent home once per sandbox, after authentication. Throw when a referenced variable is missing.                                                                      |
| `request`               | `(input: AgentInput) => Command`                                                                       | Required | Build the executable, arguments and environment for the supplied agent input.                                                                                                                                                                                                                |
| `events`                | `(line: string) => readonly AgentEvent[]`                                                              | Required | Decode one native CLI output line into normalized agent events.                                                                                                                                                                                                                              |
| `quota`                 | `((text: string) => boolean) \| undefined`                                                             | Optional | Recognize a terminal usage-limit or rate-limit message in a failure event or stderr line. When the process then fails, the turn rejects with OutpostError code quota instead of process; transient retry notices must not match.                                                             |
| `unavailable`           | `((text: string) => boolean) \| undefined`                                                             | Optional | Recognize a terminal service outage or connection failure in a failure event or stderr line. When the process then fails without a quota signal, the turn keeps code process and records details.unavailable, read by unavailableFault(); retry notices must not match.                      |
| `usageCommand`          | `((conversation: string) => Command \| undefined) \| undefined`                                        | Optional | Build a bounded read-only command to collect counters for this conversation inside the borrowed sandbox; return undefined for an unsupported identifier.                                                                                                                                     |
| `usageResult`           | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optional | Decode the successful usage command’s stdout into session totals. Return undefined when unreadable, or complete: false for partial totals; do not return transcript content.                                                                                                                 |
| `liveInput`             | `AgentLiveInput \| undefined`                                                                          | Optional | Protocol for adding user messages to a running turn over stdin, used when the lease supports live input: Claude Code stream-json and Codex app-server. Otherwise steering stops the turn and resumes its conversation.                                                                       |
| `name`                  | `string`                                                                                               | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                                                                  | Optional | Built-in agent whose pinned CLI Outpost installs on a remote sandbox when the executable is missing: an npm package, or a SHA-512-verified archive for antigravity. An unknown name fails.                                                                                                   |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                                 | Optional | Require the native final event: without it, completion markers do not match and the turn fails with code process, even when the process exits with 0.                                                                                                                                        |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`                                                  | Optional | How token usage is measured: events reads it from the output stream, session reads the session after the process exits, unavailable records none. Missing counters then mark usage incomplete; omitted, reported events are counted without that check.                                      |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                                        | Optional | Environment variables added to every command of this agent, over the values from .outpost/.env. A name also set by the sandbox provider fails with code configuration.                                                                                                                       |
| `storage`               | `ConversationStore \| undefined`                                                                       | Optional | Conversation store that captures, locates and restores this adapter’s sessions. Built-in presets default to their native store; absent when the CLI has no portable conversations.                                                                                                           |
| `capture`               | `boolean \| undefined`                                                                                 | Optional | Save the conversation to storage after each turn; false skips it. Omitted, a turn is saved whenever storage is present.                                                                                                                                                                      |
| `resumable`             | `boolean \| undefined`                                                                                 | Optional | Whether the agent can continue a conversation, as continuation, response repairs and resume-based steering require; false rejects continuation before allocation. Cold continuation also needs storage.                                                                                      |
| `forkable`              | `boolean \| undefined`                                                                                 | Optional | Whether the agent can fork a conversation; false rejects fork before allocation. Omitted, fork is attempted through request() or the fork hook.                                                                                                                                              |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optional | Read token usage from the transcript captured after the turn; a result replaces the usage reported by events, undefined keeps it.                                                                                                                                                            |

## Signature

```ts
export interface AgentAdapter extends AgentFeatures {
  fork?(
    id: string,
    invoke: (command: Command) => Promise<CommandResult>,
  ): Promise<string>;
  credentials?(variables: Variables): CredentialPlan;
  /** Plans CLI configuration merged into the agent home; throws when a referenced variable is missing. */
  configuration?(variables: Variables): AgentConfiguration;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
  /** Recognizes a usage-limit or rate-limit message in failure or stderr text. */
  quota?(text: string): boolean;
  /** Recognizes a terminal service outage or connection failure in failure or stderr text. */
  unavailable?(text: string): boolean;
  usageCommand?(conversation: string): Command | undefined;
  usageResult?(text: string): Usage | undefined;
  /** Protocol for adding user messages to a running turn through live stdin. */
  readonly liveInput?: AgentLiveInput;
}
```

## Related contracts

- [AgentConfiguration](../agentconfiguration/)
- [AgentEvent](../agentevent/)
- [AgentFeatures](../support-agentfeatures/)
- [AgentInput](../agentinput/)
- [AgentLiveInput](../agentliveinput/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [CredentialPlan](../support-credentialplan/)
- [Usage](../usage/)
- [Variables](../variables/)
