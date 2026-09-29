---
title: "AgentLiveInput"
description: "AgentLiveInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                        | Présence | Rôle                                                                                                                                                                                      |
| ---------- | --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encode`   | `(text: string) => string`  | Requis   | Encode un message utilisateur pour stdin, terminaison de ligne comprise ; sert aussi pour le prompt initial.                                                                              |
| `consumed` | `(line: string) => boolean` | Requis   | Renvoie true pour une ligne de sortie confirmant que l’agent a consommé un message utilisateur. Outpost ferme stdin après un événement final une fois tous les messages écrits consommés. |

## Signature

```ts
export interface AgentLiveInput {
  /** Encodes one user message, including its line terminator. */
  encode(text: string): string;
  /** Recognizes an output line confirming the agent consumed one user message. */
  consumed(line: string): boolean;
}
```
