---
title: "diagnoseSandbox"
description: "diagnoseSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { diagnoseSandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Probe a Sandbox or SandboxLease you own: Node.js, Git, output streams and exit status, the home directory, plus the agent CLI and a binary transfer when requested. A failed probe becomes a fail check in the resolved report and the resource stays open. Rejects with code configuration for an invalid deadlineMs or, on a Sandbox, while another operation runs.

[Complete example and detailed rules](../../guide/diagnostics/).

## Parameters and properties

| Name                      | Type                                                        | Presence | Meaning                                                                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`                  | `SandboxLease \| Sandbox`                                   | Required | Sandbox or SandboxLease to probe. A Sandbox runs the diagnosis as its own exclusive operation; a lease is probed directly. Neither is closed or released.                                                                  |
| `options`                 | `SandboxDiagnosticOptions \| undefined`                     | Optional | Agent and provider metadata, transfer probes, cancellation and per-probe deadline.                                                                                                                                         |
| `options.workspaceKind`   | `"git" \| "ephemeral" \| "directory" \| undefined`          | Optional | Selected workspace mode controlling whether Git-specific diagnostic probes are applicable.                                                                                                                                 |
| `options.agent`           | `BuiltInAgentName \| undefined`                             | Optional | Built-in agent whose CLI is checked in the sandbox: its version (agent.sandbox), then its help for each mode Outpost uses (agent.cli.&lt;mode>). Without it, no agent check runs.                                          |
| `options.deadlineMs`      | `number \| undefined`                                       | Optional | Deadline of each probe command and transfer in milliseconds, default 5000. Must be an integer from 1 to 60000, otherwise the call rejects with code configuration.                                                         |
| `options.signal`          | `AbortSignal \| undefined`                                  | Optional | Cancels the diagnosis. Already aborted, the call rejects with the abort reason; aborted during the run, the remaining probes are reported as fail.                                                                         |
| `options.transfers`       | `boolean \| undefined`                                      | Optional | true uploads a small binary file under the sandbox root, verifies it with a sandbox process, downloads it back, then removes the probe directory (checks sandbox.transfers and sandbox.transfers.cleanup). Off by default. |
| `options.sandboxProvider` | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement copied into the report. sandbox.diagnose() replaces it with the sandbox’s own provider.                                                                                                        |

## Returns

`Promise<SandboxDiagnosticReport>`

## Signature

```ts
export declare function diagnoseSandbox(
  target: Sandbox | SandboxLease,
  options?: SandboxDiagnosticOptions,
): Promise<SandboxDiagnosticReport>;
```

## Related contracts

- [Sandbox](../sandbox/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [SandboxLease](../sandboxlease/)
