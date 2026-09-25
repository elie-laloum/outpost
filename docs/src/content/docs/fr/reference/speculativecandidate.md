---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                              | Présence | Rôle                                                                                                      |
| --------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Requis   | Clé unique du candidat reliant sa branche, sa validation et son résultat final.                           |
| `agent`   | `AgentAdapter`                                                    | Requis   | Adapter natif de l’agent de code.                                                                         |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Requis   | Réglages de brief et réponse propres au candidat ; la course contrôle agent, annulation et session neuve. |

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
