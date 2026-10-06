---
title: "ReplayDecisionEvent"
description: "ReplayDecisionEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayDecisionEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                                                                                                                        | Présence  | Rôle                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `before`     | `number`                                                                                                                                                    | Requis    | Position à partir de zéro dans ReplayTurn.events avant laquelle cette observation de décision est émise ; le nombre d’événements désigne la position finale.           |
| `event`      | `DecisionEvent \| { readonly kind: "decision-request"; readonly request: unknown; } \| { readonly kind: "decision-response"; readonly response: unknown; }` | Requis    | Résumé de cycle de vie ou données verbose enregistrées de décision. Les événements détaillés de requête/réponse sont émis seulement vers un hub d’observation verbose. |
| `subagentId` | `string \| undefined`                                                                                                                                       | Optionnel | Identité enregistrée du harness enfant restaurée dans le scope d’observation du replay lorsque la décision provient d’un sous-agent.                                   |

## Signature

```ts
export interface ReplayDecisionEvent {
  readonly before: number;
  readonly event: Extract<
    ObservationEvent,
    {
      readonly kind: "decision" | "decision-request" | "decision-response";
    }
  >;
  readonly subagentId?: string;
}
```

## Contrats associés

- [ObservationEvent](../observationevent/)
