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

## Paramètres et propriétés

| Nom    | Type                                    | Présence | Rôle                                                                                                   |
| ------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `text` | `(path: string) => string \| undefined` | Requis   | Texte UTF-8 d’un fichier du bundle d’après son chemin relatif, ou undefined s’il est absent du bundle. |

## Signature

```ts
export interface SessionBundleFiles {
  text(path: string): string | undefined;
}
```
