---
title: "LifecycleCommand"
description: "LifecycleCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LifecycleCommand } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                                 | Presence | Meaning                                                                                                                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `when`        | `ChangedCondition \| undefined`                                                                      | Optional | Optional condition from changed(); without it the command runs only during initial preparation. Records the pre-command fingerprint after success and checks it before each subsequent sandbox command, dispatch or attachment. workspaceReady remains a single opening phase. |
| `executable`  | `string`                                                                                             | Required | Program run for this preparation hook without implicit shell parsing.                                                                                                                                                                                                          |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optional | Literal arguments of the preparation command; use an explicit shell for pipelines or dependent steps.                                                                                                                                                                          |
| `stdin`       | `string \| undefined`                                                                                | Optional | Initial text sent to the hook standard input before an optional input stream.                                                                                                                                                                                                  |
| `input`       | `Readable \| undefined`                                                                              | Optional | Live input stream for the hook, after stdin; not used by the file fingerprint probe.                                                                                                                                                                                           |
| `directory`   | `string \| undefined`                                                                                | Optional | Working directory and base for watched paths: defaults to the host worktree for workspaceReady/hostReady and sandbox.root for sandboxReady.                                                                                                                                    |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optional | Per-hook environment variables, applied both to the fingerprint probe and the preparation command over the execution environment variables.                                                                                                                                    |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optional | Optional hook cancellation signal combined with the lifecycle operation signal. A cancelled warm hook does not save its fingerprint and leaves the sandbox open.                                                                                                               |
| `deadlineMs`  | `number \| undefined`                                                                                | Optional | Deadline for the fingerprint probe and separately for the hook command, default 600000 ms each. A timeout prevents the requested operation and leaves a warm sandbox available for retry.                                                                                      |
| `interactive` | `boolean \| undefined`                                                                               | Optional | Run the hook using the execution environment terminal support; the fingerprint probe always runs without a terminal.                                                                                                                                                           |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | Terminal streams connected to the preparation command; the fingerprint probe does not use them.                                                                                                                                                                                |
| `elevated`    | `boolean \| undefined`                                                                               | Optional | Request elevated execution for both the fingerprint probe and command, subject to the provider capabilities; host execution ignores this option.                                                                                                                               |
| `retain`      | `number \| undefined`                                                                                | Optional | Retained trailing output for the hook command; the fingerprint probe uses its own bounded output.                                                                                                                                                                              |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optional | Receives preparation-command output chunks, excluding fingerprint-probe output. An exception fails preparation and prevents saving the fingerprint.                                                                                                                            |

## Signature

```ts
export interface LifecycleCommand extends Command {
  readonly when?: ChangedCondition;
}
```

## Related contracts

- [ChangedCondition](../changedcondition/)
- [Command](../command/)
