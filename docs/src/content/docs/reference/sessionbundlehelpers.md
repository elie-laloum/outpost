---
title: "SessionBundleHelpers"
description: "SessionBundleHelpers — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleHelpers } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                | Presence | Meaning                                                  |
| -------- | ----------------------------------- | -------- | -------------------------------------------------------- |
| `join`   | `(...segments: string[]) => string` | Required | Joins path segments with the sandbox platform separator. |
| `sha256` | `(text: string) => string`          | Required | Hexadecimal SHA-256 digest of a UTF-8 string.            |

## Signature

```ts
export interface SessionBundleHelpers {
  /** Joins sandbox path segments with the sandbox platform separator. */
  join(...segments: string[]): string;
  /** Hex SHA-256 digest of a UTF-8 string. */
  sha256(text: string): string;
}
```
