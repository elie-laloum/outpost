---
title: "AgentLiveSession"
description: "AgentLiveSession — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveSession } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                              | Présence | Rôle                                                                                                                                                                                                                               |
| -------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encode` | `(text: string) => string`        | Requis   | Encode un message utilisateur pour stdin, terminaison de ligne comprise, ou renvoie une chaîne vide lorsque la session l’envoie elle-même dès que l’agent peut accepter une entrée.                                                |
| `read`   | `(line: string) => AgentLiveRead` | Requis   | Lit une ligne de sortie et renvoie les messages utilisateur qu’elle confirme consommés ainsi que les réponses de protocole qu’Outpost écrit sur stdin, comme les requêtes d’ouverture de session ou les refus de requêtes serveur. |

## Signature

```ts
export interface AgentLiveSession {
  /** Encodes one user message for stdin, or returns "" when the session sends it later. */
  encode(text: string): string;
  /** Reads one output line: user messages it confirms and protocol replies to write. */
  read(line: string): AgentLiveRead;
}
```

## Contrats associés

- [AgentLiveRead](../agentliveread/)
