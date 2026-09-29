---
title: "ReportPass"
description: "ReportPass — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name   | Type                  | Presence | Meaning                                                                  |
| ------ | --------------------- | -------- | ------------------------------------------------------------------------ |
| `pass` | `number \| undefined` | Optional | Pass number shown in the line prefix; omitted for events outside a pass. |

## Signature

```ts
export type ReportPass = {
  readonly pass?: number;
};
```
