---
title: "ReportPass"
description: "ReportPass — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name   | Type                  | Presence | Meaning                                                                   |
| ------ | --------------------- | -------- | ------------------------------------------------------------------------- |
| `pass` | `number \| undefined` | Optional | One-based agent pass number attached to an observation or reporter state. |

## Signature

```ts
export type ReportPass = {
  readonly pass?: number;
};
```
