---
title: "ScriptedCommit"
description: "ScriptedCommit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedCommit } from "@elie-laloum/outpost/testing";
```

## Paramètres et propriétés

| Nom       | Type                                       | Présence | Rôle                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `message` | `string`                                   | Requis   | Message de commit non vide. Les commits de test utilisent l’identité Outpost Test, sans signature ni hooks hôte.                                                                                                                                             |
| `files`   | `Readonly<Record<string, string \| null>>` | Requis   | Table non vide de chemins relatifs au dépôt vers leur contenu UTF-8 ; null supprime un fichier existant. Traversées, .git, .outpost et liens symboliques sont refusés. Seuls ces chemins entrent dans le commit ; le travail indexé séparément reste indexé. |

## Signature

```ts
export interface ScriptedCommit {
  readonly message: string;
  readonly files: Readonly<Record<string, string | null>>;
}
```
