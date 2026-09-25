---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 10
---

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
