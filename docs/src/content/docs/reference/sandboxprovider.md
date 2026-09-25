---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxProvider**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name        | Type                                                 | Presence | Meaning                                                                 |
| ----------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`      | `string`                                             | Required | See the linked contract and this family's rules for its interpretation. |
| `placement` | `"mounted" \| "remote" \| "host"`                    | Required | See the linked contract and this family's rules for its interpretation. |
| `variables` | `Readonly<Record<string, string>> \| undefined`      | Optional | Explicit environment declarations; values are strings.                  |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>` | Required | See the linked contract and this family's rules for its interpretation. |

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
