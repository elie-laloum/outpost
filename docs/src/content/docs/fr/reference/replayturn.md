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

| Nom            | Type                                                                                                                                                                                                                                          | Présence  | Rôle                                                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`       | `string`                                                                                                                                                                                                                                      | Requis    | Prompt reçu par le tour enregistré ; le rejeu le compare au prompt rendu.                                                                                                                                              |
| `events`       | `readonly AgentEvent[]`                                                                                                                                                                                                                       | Requis    | Événements d’agent ou de harness réémis dans l’ordre, sans phases d’exécution, prompts ni résumés.                                                                                                                     |
| `text`         | `string`                                                                                                                                                                                                                                      | Requis    | Texte du tour renvoyé au dispatch : l’événement result, sinon les événements text concaténés, sinon les lignes brutes.                                                                                                 |
| `usage`        | `Usage`                                                                                                                                                                                                                                       | Requis    | Usage enregistré du tour, rapporté à nouveau ; aucun token n’est consommé.                                                                                                                                             |
| `conversation` | `string \| undefined`                                                                                                                                                                                                                         | Optionnel | Identifiant de conversation enregistré, utilisé seulement pour suivre les réparations de réponse pendant le rejeu.                                                                                                     |
| `failure`      | `ReplayFailure \| undefined`                                                                                                                                                                                                                  | Optionnel | Erreur enregistrée d’un tour inachevé ; le rejeu la relance après les événements et les commits.                                                                                                                       |
| `handover`     | `({ readonly kind: "fallback"; readonly from: FallbackCandidate; readonly to: FallbackCandidate; readonly failure: FallbackTrigger; readonly message: string; readonly resetAt?: string; } & { readonly subagentId?: string; }) \| undefined` | Optionnel | Événement fallback enregistré après ce tour ; le tour est alors traité comme passé en relais plutôt qu’en échec, son usage est la somme de ses événements usage enregistrés, et le rejeu enchaîne sur le tour suivant. |
| `changes`      | `WorkspaceCommitsEvent \| undefined`                                                                                                                                                                                                          | Optionnel | Commits du workspace appliqués dans la sandbox après ce tour, le dernier de son dispatch en sandbox.                                                                                                                   |
| `resumedBy`    | `readonly string[] \| undefined`                                                                                                                                                                                                              | Optionnel | Consignes de pilotage remises en mode resumed qui ont ouvert ce tour ; le prompt du tour les joint par des lignes vides.                                                                                               |
| `interrupted`  | `boolean \| undefined`                                                                                                                                                                                                                        | Optionnel | Vrai lorsque le pilotage a arrêté ce tour enregistré ; son usage est la somme de ses événements usage enregistrés et le tour rejoué indique interrupted: steering.                                                     |

## Signature

```ts
export interface ReplayTurn {
  readonly prompt: string;
  readonly events: readonly AgentEvent[];
  readonly text: string;
  readonly usage: Usage;
  readonly conversation?: string;
  readonly failure?: ReplayFailure;
  /** Recorded handover of a fallback agent to its next candidate after this turn. */
  readonly handover?: FallbackEvent;
  readonly changes?: WorkspaceCommitsEvent;
  /** Steering instructions that resumed the conversation into this turn. */
  readonly resumedBy?: readonly string[];
  /** Whether steering stopped this turn before it finished. */
  readonly interrupted?: boolean;
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [FallbackEvent](../support-fallbackevent/)
- [ReplayFailure](../replayfailure/)
- [Usage](../usage/)
- [WorkspaceCommitsEvent](../workspacecommitsevent/)
