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

| Nom                  | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `maxSteps`           | `number \| undefined`                           | Optionnel | Nombre maximal de requêtes au modèle par tour, 100 par défaut. L’atteindre sans réponse finale fait échouer le tour avec le code limit ; les requêtes de résumé ne comptent pas.                                                                                                                                                           |
| `maxDelegationDepth` | `number \| undefined`                           | Optionnel | Niveaux de délégation à des sous-agents autorisés sous ce harness, 3 par défaut ; 0 désactive la délégation. Un enfant ne peut pas relever la limite d’un ancêtre, et une délégation au-delà échoue avec le code limit, traité selon onError.                                                                                              |
| `maxToolCalls`       | `number \| undefined`                           | Optionnel | Nombre maximal d’appels d’outils par tour, sans borne par défaut. Le dépasser fait échouer le tour avec le code limit.                                                                                                                                                                                                                     |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optionnel | Plafonds de tokens par tour pour input, cached, cacheCreated et output, résumés de contexte et sous-agents compris. Contrôlés après chaque réponse ; un dépassement fait échouer le tour avec le code limit, même sur la réponse finale. Un fournisseur qui ne rapporte pas d’usage ou un usage partiel échoue avec le code configuration. |

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
