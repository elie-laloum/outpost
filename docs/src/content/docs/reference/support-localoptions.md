---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name        | Type                                            | Presence | Meaning                                                |
| ----------- | ----------------------------------------------- | -------- | ------------------------------------------------------ |
| `variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings. |

## Signature

```ts
export type LocalOptions = {
  variables?: Variables;
};
```

## Related contracts

- [Variables](../variables/)
