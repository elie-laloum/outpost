---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                 | Presence | Meaning                                                                                               |
| ----------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `name`      | `string`                                             | Required | Provider identifier used in diagnostics and resource activity records.                                |
| `placement` | `"mounted" \| "remote" \| "host"`                    | Required | Workspace access model: mounted host checkout, synchronized remote checkout or direct host execution. |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optional | Explicit environment declarations; values are strings.                                                |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Required | Allocate an execution lease for the prepared workspace context.                                       |

## Signature

```ts
export interface SandboxProvider {
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Related contracts

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [Variables](../variables/)
