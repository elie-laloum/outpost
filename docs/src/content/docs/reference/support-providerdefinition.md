---
title: "ProviderDefinition"
description: "ProviderDefinition — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name        | Type                                                 | Presence | Meaning                                                                             |
| ----------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `name`      | `string`                                             | Required | Provider identifier used in diagnostics and resource activity records.              |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optional | Explicit environment declarations; values are strings.                              |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Required | Allocate the lease using the prepared workspace and explicit environment variables. |

## Signature

```ts
export interface ProviderDefinition {
  readonly name: string;
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Related contracts

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [Variables](../variables/)
