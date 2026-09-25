---
title: "ProviderDefinition"
description: "ProviderDefinition — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name        | Type                                                 | Presence | Meaning                                                                 |
| ----------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`      | `string`                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optional | Explicit environment declarations; values are strings.                  |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Required | See the linked contract and this family's rules for its interpretation. |

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
