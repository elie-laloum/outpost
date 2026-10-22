---
title: "ExecutionDiagnostic"
description: "ExecutionDiagnostic — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ExecutionDiagnostic } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name      | Type     | Presence | Meaning                                                                                                                                                                        |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `code`    | `string` | Required | Stable identifier of the incompatibility, independent of the wording: unsupported-provider, missing-source, unsupported-binding, unsupported-capability or git-workspace-only. |
| `message` | `string` | Required | The message createSandbox() or dispatch() raises for this incompatibility.                                                                                                     |

## Signature

```ts
export interface ExecutionDiagnostic {
  readonly code: string;
  readonly message: string;
}
```
