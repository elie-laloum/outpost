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

| Nom       | Type                                                              | Présence | Rôle                                                                                                                                                                                                                                                                                            |
| --------- | ----------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Requis   | Clé unique du candidat reliant sa branche, sa validation et son résultat final.                                                                                                                                                                                                                 |
| `agent`   | `DispatchAgent`                                                   | Requis   | Agent qui exécute le dispatch : un agent unique composé avec agent() ou replayAgent(), ou un fallbackAgent() dont les candidats sont essayés dans l’ordre sur les échecs de quota ou de panne listés. Le candidat ne prend le statut quota que lorsque tous ses secours ont atteint une limite. |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Requis   | Réglages de brief et réponse propres au candidat ; la course contrôle agent, annulation et session neuve.                                                                                                                                                                                       |

## Signature

```ts
export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: DispatchAgent;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [DispatchOptions](../dispatchoptions/)
