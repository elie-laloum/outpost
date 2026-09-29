---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`         | `string \| undefined`                                            | Optionnel | Prompt préparé transmis au CLI natif de l’agent.                                                                                                                                                                                                    |
| `interactive`  | `boolean \| undefined`                                           | Optionnel | Lance la CLI dans une session de terminal interactive au lieu de son mode flux non interactif.                                                                                                                                                      |
| `liveInput`    | `boolean \| undefined`                                           | Optionnel | Demande le protocole liveInput de l’adapter : encoder le prompt avec lui sur stdin et garder stdin ouvert pour d’autres messages utilisateur. Outpost ne le positionne que si le dispatch a un pilotage et que le lease accepte l’entrée en direct. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci.                                                                                                                                      |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  /** Requests the liveInput protocol: stdin carries the encoded prompt and stays open. */
  readonly liveInput?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
