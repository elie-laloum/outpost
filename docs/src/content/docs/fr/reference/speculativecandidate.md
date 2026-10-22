---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost/speculation";
```

## Paramètres et propriétés

| Nom       | Type                                                              | Présence | Rôle                                                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Requis   | Nom unique de 1 à 64 lettres, chiffres, _ ou -, commençant par une lettre ou un chiffre. Il figure dans le nom de la branche du candidat.                                                                                                      |
| `agent`   | `DispatchAgent`                                                   | Requis   | Agent qui exécute le candidat : issu de createAgent() ou createReplayAgent(), ou un createFallbackAgent(). Une faute quota qui atteint la course, y compris une faute que l’agent de secours n’absorbe pas, donne au candidat le statut quota. |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Requis   | Options de dispatch de ce candidat, par exemple brief et response. La course fournit agent et signal ; continuation n’est pas accepté.                                                                                                         |

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
