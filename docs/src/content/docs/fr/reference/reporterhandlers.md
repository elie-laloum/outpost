---
title: "ReporterHandlers"
description: "ReporterHandlers — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReporterHandlers } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                                                                                                                                     | Présence  | Rôle                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phase`          | `((event: { readonly kind: "phase"; readonly name: string; readonly agent?: string; readonly branch?: string; readonly directory?: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                  | Optionnel | Traite : phase d’exécution et métadonnées disponibles de l’agent et du workspace ; reçoit pass et at et peut retourner une promesse.                                    |
| `summary`        | `((event: { readonly kind: "summary"; readonly durationMs: number; readonly status: number; readonly tokens: import("../domain/agent.types.ts").Usage; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                      | Optionnel | Traite : durée, statut de sortie et totaux de tokens de la passe terminée ; reçoit pass et at et peut retourner une promesse.                                           |
| `warning`        | `((event: { readonly kind: "warning"; readonly message: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optionnel | Traite : message d’avertissement non fatal ; reçoit pass et at et peut retourner une promesse.                                                                          |
| `text`           | `((event: { readonly kind: "text"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                   | Optionnel | Traite : fragment de texte de l’agent ; reçoit pass et at et peut retourner une promesse.                                                                               |
| `result`         | `((event: { readonly kind: "result"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                 | Optionnel | Traite : texte de réponse finale de l’agent ; reçoit pass et at et peut retourner une promesse.                                                                         |
| `prompt`         | `((event: { readonly kind: "prompt"; readonly text: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                 | Optionnel | Traite : prompt rendu envoyé à l’agent ; reçoit pass et at et peut retourner une promesse.                                                                              |
| `tool`           | `((event: { readonly kind: "tool"; readonly name: string; readonly input: unknown; readonly callId?: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                | Optionnel | Traite : nom et entrée d’outil signalés par l’agent ; reçoit pass et at et peut retourner une promesse.                                                                 |
| `tool-result`    | `((event: { readonly kind: "tool-result"; readonly callId: string; readonly name: string; readonly isError: boolean; readonly preview: string; readonly characters: number; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined` | Optionnel | Traite : résultat d’outil d’un harness personnalisé, avec identifiant d’appel, indicateur d’erreur et aperçu borné ; reçoit pass et at et peut retourner une promesse.  |
| `step`           | `((event: { readonly kind: "step"; readonly index: number; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                  | Optionnel | Traite : début d’une étape de harness personnalisé avant sa requête au modèle ; reçoit pass et at et peut retourner une promesse.                                       |
| `tool-denied`    | `((event: { readonly kind: "tool-denied"; readonly callId: string; readonly name: string; readonly reason: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                          | Optionnel | Traite : appel d’outil refusé par les permissions ou un hook, avec sa raison ; reçoit pass et at et peut retourner une promesse.                                        |
| `stop-prevented` | `((event: { readonly kind: "stop-prevented"; readonly message: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                      | Optionnel | Traite : réponse finale refusée par un hook stop, avec le message renvoyé ; reçoit pass et at et peut retourner une promesse.                                           |
| `compaction`     | `((event: { readonly kind: "compaction"; readonly strategy: string; readonly messages: number; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                              | Optionnel | Traite : compaction de l’historique d’un harness personnalisé, avec le nom de la stratégie et le nombre de messages ; reçoit pass et at et peut retourner une promesse. |
| `conversation`   | `((event: { readonly kind: "conversation"; readonly id: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optionnel | Traite : identifiant de conversation native ; reçoit pass et at et peut retourner une promesse.                                                                         |
| `usage`          | `((event: { readonly kind: "usage"; readonly tokens: import("../domain/agent.types.ts").Usage; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                              | Optionnel | Traite : consommation incrémentale de tokens déclarée ; reçoit pass et at et peut retourner une promesse.                                                               |
| `failure`        | `((event: { readonly kind: "failure"; readonly message: string; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                             | Optionnel | Traite : message d’échec émis par le protocole agent, et non tous les rejets du dispatch ; reçoit pass et at et peut retourner une promesse.                            |
| `finished`       | `((event: { readonly kind: "finished"; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                                      | Optionnel | Traite : fin du protocole agent, avant synchronisation et nettoyage du dispatch ; reçoit pass et at et peut retourner une promesse.                                     |
| `raw`            | `((event: { readonly kind: "raw"; readonly value: unknown; } & { readonly pass: number; readonly at: string; }) => void \| Promise<void>) \| undefined`                                                                                                                  | Optionnel | Traite : données brutes du protocole, pouvant contenir des informations sensibles ; reçoit pass et at et peut retourner une promesse.                                   |

## Signature

```ts
export type ReporterHandlers = {
  readonly [Kind in AgentObservation["kind"]]?: (
    event: Extract<
      AgentObservation,
      {
        kind: Kind;
      }
    >,
  ) => void | Promise<void>;
};
```

## Contrats associés

- [AgentObservation](../agentobservation/)
