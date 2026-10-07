---
title: "RunReportDiff"
description: "RunReportDiff — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportDiff } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                       | Présence | Rôle                                                                                                                                       |
| -------------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseline`     | `string`                   | Requis   | Commit HEAD exact avant l’exécution ; pour plusieurs passes froides, base de la première passe.                                            |
| `head`         | `string`                   | Requis   | Commit HEAD exact après synchronisation ; pour plusieurs passes froides, HEAD de la dernière passe.                                        |
| `files`        | `readonly RunReportFile[]` | Requis   | Entrées numstat Git entre baseline et head avec détection des renommages. Un fichier renommé occupe une entrée contenant les deux chemins. |
| `filesChanged` | `number`                   | Requis   | Nombre d’entrées de fichiers modifiés dans le diff commité net ; un renommage compte une fois.                                             |
| `added`        | `number`                   | Requis   | Somme des lignes de texte ajoutées dans le diff commité net ; les entrées binaires contribuent zéro.                                       |
| `removed`      | `number`                   | Requis   | Somme des lignes de texte supprimées dans le diff commité net ; les entrées binaires contribuent zéro.                                     |
| `binaryFiles`  | `number`                   | Requis   | Nombre d’entrées de diff que Git considère binaires et dont les lignes modifiées ne sont pas dénombrables.                                 |

## Signature

```ts
export interface RunReportDiff {
  readonly baseline: string;
  readonly head: string;
  readonly files: readonly RunReportFile[];
  readonly filesChanged: number;
  readonly added: number;
  readonly removed: number;
  readonly binaryFiles: number;
}
```

## Contrats associés

- [RunReportFile](../runreportfile/)
