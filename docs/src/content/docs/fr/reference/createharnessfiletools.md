---
title: "createHarnessFileTools"
description: "createHarnessFileTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessFileTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils files. read_file renvoie jusqu’à 2000 lignes numérotées d’un fichier UTF-8 et refuse les liens symboliques, les fichiers binaires et ceux de plus de 4 Mio ; list_files liste jusqu’à 1000 fichiers que Git suit ou n’ignore pas. Les deux sont en lecture seule et déclarent leurs chemins pour les règles de permission.

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
export declare function createHarnessFileTools(
  options?: FileSelectionOptions,
): HarnessToolset;
```

## Contrats associés

- [FileSelectionOptions](../fileselectionoptions/)
- [HarnessToolset](../harnesstoolset/)
