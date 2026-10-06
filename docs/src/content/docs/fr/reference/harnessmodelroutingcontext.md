---
title: "HarnessModelRoutingContext"
description: "HarnessModelRoutingContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRoutingContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                       | Présence | Rôle                                                                                                                    |
| ---------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `system`   | `string`                   | Requis   | Instructions de session déjà résolues une fois pour l’exécution.                                                        |
| `messages` | `readonly ModelMessage[]`  | Requis   | Messages courants après compaction ; les fonctions d’état doivent exclure explicitement le raisonnement opaque inutile. |
| `tools`    | `readonly ModelToolSpec[]` | Requis   | Déclarations d’outils visibles du modèle disponibles pour cette étape.                                                  |
| `step`     | `number`                   | Requis   | Étape du harness numérotée à partir de un, avant la requête au modèle conversationnel.                                  |
| `model`    | `AgentModel`               | Requis   | Modèle effectif actif avant la nouvelle sélection, utilisé aussi par la compaction précédente.                          |
| `signal`   | `AbortSignal`              | Requis   | Signal d’annulation de l’exécution ; les fonctions d’état et providers doivent le respecter.                            |

## Signature

```ts
export interface HarnessModelRoutingContext {
  readonly system: string;
  readonly messages: readonly ModelMessage[];
  readonly tools: readonly ModelToolSpec[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [ModelMessage](../modelmessage/)
- [ModelToolSpec](../modeltoolspec/)
