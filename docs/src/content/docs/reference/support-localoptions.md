---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name        | Type                                            | Presence | Meaning                                                                                                                       |
| ----------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables added to host commands, as literal values. A key the agent also declares fails with code configuration. |

## Signature

```ts
export type LocalOptions = {
  variables?: Variables;
};
```

## Related contracts

- [Variables](../variables/)
