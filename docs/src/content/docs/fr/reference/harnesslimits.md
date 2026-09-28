---
title: "HarnessLimits"
description: "HarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessLimits } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`           | `number \| undefined`                           | Optionnel | Nombre maximal de requêtes au modèle dans une passe ; 100 par défaut.                                                                                                                                                                                                                                 |
| `maxDelegationDepth` | `number \| undefined`                           | Optionnel | Nombre maximal de niveaux supplémentaires de délégation depuis ce harness ; 3 par défaut, 0 désactive la délégation et la limite d’un ancêtre ne peut pas être augmentée.                                                                                                                             |
| `maxToolCalls`       | `number \| undefined`                           | Optionnel | Nombre maximal d’appels d’outils dans une passe ; seulement borné par maxSteps s’il est omis.                                                                                                                                                                                                         |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optionnel | Plafonds de tokens observés par tour, incluant les résumés de contexte et tous les descendants. Contrôlés après chaque réponse complète et avant une nouvelle requête ; un dépassement échoue même sur la réponse finale. L’usage absent ou partiel fait échouer une exécution avec budget de tokens. |

## Signature

```ts
export interface HarnessLimits {
  readonly maxSteps?: number;
  readonly maxDelegationDepth?: number;
  readonly maxToolCalls?: number;
  readonly usage?: Partial<Omit<Usage, "complete">>;
}
```

## Contrats associés

- [Usage](../usage/)
