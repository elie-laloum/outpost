---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeCandidate**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom       | Type                                                              | Présence | Rôle                                                                             |
| --------- | ----------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Requis   | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `agent`   | `AgentAdapter`                                                    | Requis   | Adapter natif de l’agent de code.                                                |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: AgentAdapter;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
