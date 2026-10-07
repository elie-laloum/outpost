---
title: "DiffGuard"
description: "DiffGuard — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiffGuard } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                             | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `protectedPaths`  | `readonly string[] \| undefined` | Optionnel | Motifs relatifs à la racine et sensibles à la casse des chemins interdits dans le diff commité final ; absent ou vide désactive les restrictions de chemins. Accepte *, ? et ** avec des barres obliques ; / initial, préfixes de lecteur, barres inverses, NUL et segments . ou .. sont refusés. Vérifie les deux chemins d’un renommage. Les modifications restaurées et les fichiers non commités sont exclus.        |
| `maxChangedLines` | `number \| undefined`            | Optionnel | Nombre maximal de lignes textuelles ajoutées plus supprimées dans le diff commité final ; absent désactive cette limite. Exige un entier sûr positif ou nul ; l’égalité est acceptée et zéro interdit les modifications textuelles. Un renommage détecté sans changement de contenu ajoute zéro ligne. Les changements binaires sont refusés dès que cette limite est définie, car Git ne peut pas compter leurs lignes. |

## Signature

```ts
export interface DiffGuard {
  readonly protectedPaths?: readonly string[];
  readonly maxChangedLines?: number;
}
```
