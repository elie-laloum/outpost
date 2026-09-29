---
title: "DiagnosticCheck"
description: "DiagnosticCheck — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiagnosticCheck } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                                                                                                       |
| ------------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | `string`              | Required | Stable dotted identifier, such as sandbox.node, agent.cli.resume or model.                                                                                    |
| `status`           | `DiagnosticStatus`    | Required | pass, warn, fail or skipped. Only fail sets hasFailures; warn marks a differing or unconfirmed result, such as an agent version other than the pinned one.    |
| `message`          | `string`              | Required | Explanation of the result; most failures end with a remedy.                                                                                                   |
| `version`          | `string \| undefined` | Optional | Version read from the output of a --version probe; present on version checks only.                                                                            |
| `referenceVersion` | `string \| undefined` | Optional | Agent CLI version pinned by Outpost that the detected version was compared with; present on agent version checks only. A different version gives status warn. |

## Signature

```ts
export interface DiagnosticCheck {
  readonly id: string;
  readonly status: DiagnosticStatus;
  readonly message: string;
  readonly version?: string;
  readonly referenceVersion?: string;
}
```

## Related contracts

- [DiagnosticStatus](../diagnosticstatus/)
