---
title: "SessionBundleFiles"
description: "SessionBundleFiles — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleFiles } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type                                    | Presence | Meaning                                                                                                 |
| ------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `text` | `(path: string) => string \| undefined` | Required | UTF-8 text of a bundled file by bundle-relative path, or undefined when the bundle does not contain it. |

## Signature

```ts
export interface SessionBundleFiles {
  text(path: string): string | undefined;
}
```
