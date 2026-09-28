---
title: "ReplayTurn"
description: "ReplayTurn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayTurn } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                 | Présence  | Rôle                                                                                                                   |
| -------------- | ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `prompt`       | `string`                             | Requis    | Prompt reçu par le tour enregistré ; le rejeu le compare au prompt rendu.                                              |
| `events`       | `readonly AgentEvent[]`              | Requis    | Événements d’agent ou de harness réémis dans l’ordre, sans phases d’exécution, prompts ni résumés.                     |
| `text`         | `string`                             | Requis    | Texte du tour renvoyé au dispatch : l’événement result, sinon les événements text concaténés, sinon les lignes brutes. |
| `usage`        | `Usage`                              | Requis    | Usage enregistré du tour, rapporté à nouveau ; aucun token n’est consommé.                                             |
| `conversation` | `string \| undefined`                | Optionnel | Identifiant de conversation enregistré, utilisé seulement pour suivre les réparations de réponse pendant le rejeu.     |
| `failure`      | `ReplayFailure \| undefined`         | Optionnel | Erreur enregistrée d’un tour inachevé ; le rejeu la relance après les événements et les commits.                       |
| `changes`      | `WorkspaceCommitsEvent \| undefined` | Optionnel | Commits du workspace appliqués dans la sandbox après ce tour, le dernier de son dispatch en sandbox.                   |

## Signature

```ts
export interface ReplayTurn {
  readonly prompt: string;
  readonly events: readonly AgentEvent[];
  readonly text: string;
  readonly usage: Usage;
  readonly conversation?: string;
  readonly failure?: ReplayFailure;
  readonly changes?: WorkspaceCommitsEvent;
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [ReplayFailure](../replayfailure/)
- [Usage](../usage/)
- [WorkspaceCommitsEvent](../workspacecommitsevent/)
