---
title: "ResolvedHarnessLimits"
description: "ResolvedHarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                  | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`           | `number`                                        | Requis    | Nombre maximal effectif de requêtes au modèle par tour, défauts appliqués.                                                                                                                                                                    |
| `maxDelegationDepth` | `number \| undefined`                           | Optionnel | Niveaux de délégation à des sous-agents autorisés sous ce harness, 3 par défaut ; 0 désactive la délégation. Un enfant ne peut pas relever la limite d’un ancêtre, et une délégation au-delà échoue avec le code limit, traité selon onError. |
| `maxToolCalls`       | `number \| undefined`                           | Optionnel | Nombre maximal d’appels d’outils par tour, s’il est défini.                                                                                                                                                                                   |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optionnel | Budget de tokens configuré par compteur d’usage, s’il est défini.                                                                                                                                                                             |

## Signature

```ts
export interface ResolvedHarnessLimits extends HarnessLimits {
  readonly maxSteps: number;
}
```

## Contrats associés

- [HarnessLimits](../harnesslimits/)
