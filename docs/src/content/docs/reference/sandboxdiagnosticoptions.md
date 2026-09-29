---
title: "SandboxDiagnosticOptions"
description: "SandboxDiagnosticOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxDiagnosticOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                        | Presence | Meaning                                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`           | `BuiltInAgentName \| undefined`                             | Optional | Built-in agent whose CLI is checked in the sandbox: its version (agent.sandbox), then its help for each mode Outpost uses (agent.cli.&lt;mode>). Without it, no agent check runs.                                          |
| `deadlineMs`      | `number \| undefined`                                       | Optional | Deadline of each probe command and transfer in milliseconds, default 5000. Must be an integer from 1 to 60000, otherwise the call rejects with code configuration.                                                         |
| `signal`          | `AbortSignal \| undefined`                                  | Optional | Cancels the diagnosis. Already aborted, the call rejects with the abort reason; aborted during the run, the remaining probes are reported as fail.                                                                         |
| `transfers`       | `boolean \| undefined`                                      | Optional | true uploads a small binary file under the sandbox root, verifies it with a sandbox process, downloads it back, then removes the probe directory (checks sandbox.transfers and sandbox.transfers.cleanup). Off by default. |
| `sandboxProvider` | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement copied into the report. sandbox.diagnose() replaces it with the sandbox’s own provider.                                                                                                        |

## Signature

```ts
export interface SandboxDiagnosticOptions {
  readonly agent?: DoctorAgent;
  readonly deadlineMs?: number;
  readonly signal?: AbortSignal;
  readonly transfers?: boolean;
  readonly sandboxProvider?: Pick<SandboxProvider, "name" | "placement">;
}
```

## Related contracts

- [DoctorAgent](../doctoragent/)
- [SandboxProvider](../sandboxprovider/)
