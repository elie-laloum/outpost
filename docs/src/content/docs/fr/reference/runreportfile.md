---
title: "RunReportFile"
description: "RunReportFile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportFile } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                | Présence | Rôle                                                                                                                                              |
| --------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paths`   | `readonly string[]` | Requis   | Chemin relatif au dépôt, ou anciens et nouveaux chemins pour un renommage. Les caractères restent littéraux en JSON et sont échappés en Markdown. |
| `added`   | `number`            | Requis   | Lignes de texte ajoutées pour ce fichier ; zéro pour les binaires même si leurs octets ont changé.                                                |
| `removed` | `number`            | Requis   | Lignes de texte supprimées pour ce fichier ; zéro pour les binaires même si leurs octets ont changé.                                              |
| `binary`  | `boolean`           | Requis   | Vrai quand numstat Git ne peut pas compter les lignes ajoutées et supprimées de ce fichier.                                                       |

## Signature

```ts
export interface RunReportFile {
  readonly paths: readonly string[];
  readonly added: number;
  readonly removed: number;
  readonly binary: boolean;
}
```
