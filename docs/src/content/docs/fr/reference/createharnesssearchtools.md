---
title: "createHarnessSearchTools"
description: "createHarnessSearchTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessSearchTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils search : search exécute git grep avec une expression régulière étendue sur les fichiers texte suivis ou non ignorés et renvoie des correspondances chemin:ligne:texte, 200 au plus par appel. Il est en lecture seule et déclare son chemin pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Paramètres et propriétés

| Nom                 | Type                                 | Présence  | Rôle                                                                                                                             |
| ------------------- | ------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `FileSelectionOptions \| undefined`  | Optionnel | Options sélectionnant la source, les capacités d’exécution ou les préconditions de récupération inspectées pour cette opération. |
| `options.selection` | `"git" \| "filesystem" \| undefined` | Optionnel | git par défaut pour les appels legacy ; filesystem effectue un parcours borné dans la sandbox sans Git ni filtrage .gitignore.   |

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessSearchTools(
  options?: FileSelectionOptions,
): HarnessToolset;
```

## Contrats associés

- [FileSelectionOptions](../fileselectionoptions/)
- [HarnessToolset](../harnesstoolset/)
