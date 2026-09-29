---
title: "ProviderDefinition"
description: "ProviderDefinition — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name        | Type                                                 | Presence | Meaning                                                                                                             |
| ----------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `name`      | `string`                                             | Required | Identifier recorded in diagnostics and resource activity; a blank name fails with code configuration.               |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optional | Environment variables set for every command in the sandbox, as literal values; the factory copies and freezes them. |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Required | Allocates one environment and returns its lease; the factory adds the placement.                                    |

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
