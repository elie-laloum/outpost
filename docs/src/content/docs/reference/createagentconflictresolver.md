---
title: "createAgentConflictResolver"
description: "createAgentConflictResolver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an opt-in conflict strategy that prepares a merge in the supplied resolution workspace, runs one agent dispatch, then executes mandatory verification in the same sandbox. It requires both a sandboxProvider and a noninteractive verification command, returns the verified commit, usage and check output, and closes its sandbox on every outcome. It rejects unresolved entries, missing ancestry, uncommitted nonignored changes and commits changed by verification. No model or sandbox runs during construction.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                      | Type                                               | Presence | Meaning                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agent`                   | `DispatchAgent`                                    | Required | Agent used for one dispatch to resolve the pending merge; CLI, built-in harness and explicit fallback agents use their normal protocols and authentication.                                                                                                                                                              |
| `options`                 | `AgentConflictResolverOptions`                     | Required | Explicit execution provider, mandatory verification command and optional instructions, observation callback and journal for the resolution dispatch.                                                                                                                                                                     |
| `options.sandboxProvider` | `SandboxProvider`                                  | Required | Explicit provider that allocates the resolution sandbox. It is independent of the agent and original task provider; there is no implicit host fallback.                                                                                                                                                                  |
| `options.verify`          | `Command`                                          | Required | Mandatory noninteractive command executed after the agent commits the combined resolution, in the resolution sandbox root. Rejects directory, terminal and live input overrides. A nonzero status fails with code process; default deadlineMs is 300000 and caller cancellation is combined with the integration signal. |
| `options.instructions`    | `string \| undefined`                              | Optional | Additional literal instructions appended to the built-in resolution brief. They guide the agent; verification, ancestry and diff guards are enforced independently.                                                                                                                                                      |
| `options.observe`         | `((event: AgentObservation) => void) \| undefined` | Optional | Historical agent observation callback for the resolution dispatch. Failures are isolated by the normal dispatch observation path.                                                                                                                                                                                        |
| `options.logging`         | `Logging \| undefined`                             | Optional | Journal configuration for the resolution sandbox dispatch; omitted uses the normal local journal, false disables it.                                                                                                                                                                                                     |

## Returns

`ConflictResolver`

## Signature

```ts
export declare function createAgentConflictResolver(
  agent: DispatchAgent,
  options: AgentConflictResolverOptions,
): ConflictResolver;
```

## Related contracts

- [AgentConflictResolverOptions](../agentconflictresolveroptions/)
- [ConflictResolver](../conflictresolver/)
- [DispatchAgent](../dispatchagent/)
