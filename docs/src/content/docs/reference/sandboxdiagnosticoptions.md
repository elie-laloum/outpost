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

| Name              | Type                                                        | Presence | Meaning                                                                       |
| ----------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `agent`           | `DoctorAgent \| undefined`                                  | Optional | Agent CLI identifier to report or diagnose: claude, codex or gemini.          |
| `deadlineMs`      | `number \| undefined`                                       | Optional | Maximum duration of each diagnostic probe in milliseconds.                    |
| `signal`          | `AbortSignal \| undefined`                                  | Optional | Cooperative cancellation for this operation.                                  |
| `transfers`       | `boolean \| undefined`                                      | Optional | Enable temporary upload/download probes during sandbox diagnosis.             |
| `sandboxProvider` | `Pick<SandboxProvider, "name" \| "placement"> \| undefined` | Optional | Provider name and placement metadata used to interpret the diagnostic report. |

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
