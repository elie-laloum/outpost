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

## Paramètres et propriétés

| Nom      | Type                                | Présence | Rôle                                                                               |
| -------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `join`   | `(...segments: string[]) => string` | Requis   | Assemble des segments de chemin avec le séparateur de la plateforme de la sandbox. |
| `sha256` | `(text: string) => string`          | Requis   | Empreinte SHA-256 hexadécimale d’une chaîne UTF-8.                                 |

## Signature

```ts
export interface SessionBundleHelpers {
  /** Joins sandbox path segments with the sandbox platform separator. */
  join(...segments: string[]): string;
  /** Hex SHA-256 digest of a UTF-8 string. */
  sha256(text: string): string;
}
```
