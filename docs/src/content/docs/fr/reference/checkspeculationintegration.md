---
title: "checkSpeculationIntegration"
description: "checkSpeculationIntegration — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
La spéculation est expérimentale : ses options et son résultat peuvent encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
```

## Rôle et comportement

Vérifie avec git merge-tree si une branche candidate se fusionne dans le HEAD du checkout hôte, sans modifier ses fichiers ni son index. Renvoie clean ou conflict avec les commits exacts vérifiés, ou blocked si le checkout est sale ou détaché, si la branche a bougé ou si Git échoue. Ne fusionne jamais.

[Exemple complet et règles détaillées](../../guide/speculation/).

## Paramètres et propriétés

| Nom              | Type                  | Présence  | Rôle                                                                                                                  |
| ---------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`              | Requis    | Checkout Git hôte à vérifier ; il doit être propre et sur une branche.                                                |
| `branch`         | `string`              | Requis    | Branche ou référence candidate, résolue en commit et vérifiée contre le HEAD du checkout.                             |
| `expectedCommit` | `string \| undefined` | Optionnel | Commit validé auparavant, en général winner.commit ; la vérification est bloquée si la branche ne pointe plus dessus. |

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
