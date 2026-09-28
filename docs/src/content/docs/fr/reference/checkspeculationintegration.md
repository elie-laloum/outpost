---
title: "checkSpeculationIntegration"
description: "checkSpeculationIntegration — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
```

## Rôle et comportement

Résout une référence candidate et utilise Git merge-tree pour la vérifier contre le commit hôte courant sans modifier l’index ni le worktree. Renvoie les chemins en conflit ou une raison de blocage et identifie les commits inspectés. Relancer avant une intégration explicite si une référence ou les fichiers hôtes changent.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom              | Type                  | Présence  | Rôle                                                                                                        |
| ---------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`              | Requis    | Checkout Git hôte à inspecter sans changer son index ni ses fichiers de travail.                            |
| `branch`         | `string`              | Requis    | Référence du candidat à résoudre en commit et à vérifier contre le HEAD hôte courant.                       |
| `expectedCommit` | `string \| undefined` | Optionnel | Commit validé optionnel du candidat ; bloque la vérification si la référence a changé depuis la validation. |

## Retour

`Promise<SpeculationIntegration>`

## Signature

```ts
export declare function checkSpeculationIntegration(
  repository: string,
  branch: string,
  expectedCommit?: string,
): Promise<SpeculationIntegration>;
```

## Contrats associés

- [SpeculationIntegration](../speculationintegration/)
