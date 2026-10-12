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

[Complete example and detailed rules](../../guide/resolving-conflicts/).

## Parameters and properties

| Name                      | Type                                               | Presence | Meaning                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agent`                   | `DispatchAgent`                                    | Required | Agent used for one dispatch to resolve the pending merge; CLI, built-in harness and explicit fallback agents use their normal protocols and authentication.                                                                                                                                                              |
| `options`                 | `AgentConflictResolverOptions`                     | Required | Explicit execution provider, mandatory verification command and optional instructions, observation callback and journal for the resolution dispatch.                                                                                                                                                                     |
| `options.sandboxProvider` | `SandboxProvider`                                  | Required | Explicit provider that allocates the resolution sandbox. It is independent of the agent and original task provider; there is no implicit host fallback.                                                                                                                                                                  |
| `options.verify`          | `Command`                                          | Required | Mandatory noninteractive command executed after the agent commits the combined resolution, in the resolution sandbox root. Rejects directory, terminal and live input overrides. A nonzero status fails with code process; default deadlineMs is 300000 and caller cancellation is combined with the integration signal. |
| `options.instructions`    | `string \| undefined`                              | Optional | Additional literal instructions appended to the built-in resolution brief. They guide the agent; verification, ancestry and diff guards are enforced independently. [Exact injected text and customization limits](../createagentconflictresolver/#outpost-instructions).                                                |
| `options.observe`         | `((event: AgentObservation) => void) \| undefined` | Optional | Historical agent observation callback for the resolution dispatch. Failures are isolated by the normal dispatch observation path.                                                                                                                                                                                        |
| `options.logging`         | `Logging \| undefined`                             | Optional | Journal configuration for the resolution sandbox dispatch; omitted uses the normal local journal, false disables it.                                                                                                                                                                                                     |

## Returns

`ConflictResolver`

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

After preparing the conflicting merge in the separate resolution workspace, the resolver sends this literal brief to its agent:

```text
Resolve the pending Git merge in this workspace. Candidate commit: ${candidateCommit}. Host commit: ${hostCommit}.
Conflicting paths: ${conflictsJSON}. Preserve the intent of both branches.
Resolve every unmerged entry, stage the resolution and commit the merge. Do not abort the merge, rewrite history, change other branches or weaken tests to make them pass.
${instructions}
```

`candidateCommit` and `hostCommit` are the frozen source and host commits from `ConflictContext`. `conflictsJSON` is `JSON.stringify(context.conflicts)`. `instructions` is `options.instructions`, or an empty string; it is appended without variable or command expansion.

`instructions` adds guidance and does not replace the built-in text. A custom [ConflictResolver](../conflictresolver/) can replace the whole strategy. Verification, ancestry checks and workspace guards are enforced separately from the prompt. A conflict-free merge does not invoke this agent.

Implementation: [agent-conflict-resolver.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/agent-conflict-resolver.ts).

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
