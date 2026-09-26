---
title: "AgentEvent"
description: "AgentEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                                                                                                                                                                                                                             | Présence          | Rôle                                                                                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"phase" \| "summary" \| "warning" \| "text" \| "result" \| "prompt" \| "tool" \| "tool-result" \| "step" \| "tool-denied" \| "stop-prevented" \| "compaction" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished ou raw. |
| `name`       | `string`                                                                                                                                                                                                                         | Selon la variante | Nom de la phase pour les événements phase, ou nom de l’outil pour les événements tool et tool-result.                                                                                                                   |
| `agent`      | `string \| undefined`                                                                                                                                                                                                            | Selon la variante | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini.                                                                                                                                      |
| `branch`     | `string \| undefined`                                                                                                                                                                                                            | Selon la variante | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                                                                                                  |
| `directory`  | `string \| undefined`                                                                                                                                                                                                            | Selon la variante | Dossier hôte du workspace utilisé pour cette exécution.                                                                                                                                                                 |
| `durationMs` | `number`                                                                                                                                                                                                                         | Selon la variante | Durée d’exécution écoulée en millisecondes.                                                                                                                                                                             |
| `status`     | `number`                                                                                                                                                                                                                         | Selon la variante | Code de sortie du processus ; zéro indique le succès.                                                                                                                                                                   |
| `tokens`     | `Usage`                                                                                                                                                                                                                          | Selon la variante | Compteurs d’usage de tokens portés par un événement usage ou summary.                                                                                                                                                   |
| `message`    | `string`                                                                                                                                                                                                                         | Selon la variante | Message d’avertissement ou d’échec, ou message qu’un hook stop a renvoyé au modèle.                                                                                                                                     |
| `text`       | `string`                                                                                                                                                                                                                         | Selon la variante | Texte porté par l’événement : texte diffusé, réponse finale ou prompt soumis selon kind.                                                                                                                                |
| `input`      | `unknown`                                                                                                                                                                                                                        | Selon la variante | Arguments bruts fournis à l’outil nommé par cet événement tool.                                                                                                                                                         |
| `callId`     | `string \| undefined \| string \| string`                                                                                                                                                                                        | Selon la variante | Identifiant qui relie un événement tool à son événement tool-result ; fourni par les harness personnalisés.                                                                                                             |
| `isError`    | `boolean`                                                                                                                                                                                                                        | Selon la variante | Indique si l’appel d’outil a échoué ou signalé une erreur.                                                                                                                                                              |
| `preview`    | `string`                                                                                                                                                                                                                         | Selon la variante | Début du résultat de l’outil, borné pour les journaux et les rapporteurs.                                                                                                                                               |
| `characters` | `number`                                                                                                                                                                                                                         | Selon la variante | Longueur complète du résultat de l’outil avant toute troncature.                                                                                                                                                        |
| `index`      | `number`                                                                                                                                                                                                                         | Selon la variante | Numéro d’étape, à partir de 1, d’une passe de harness personnalisé.                                                                                                                                                     |
| `reason`     | `string`                                                                                                                                                                                                                         | Selon la variante | Pourquoi un harness personnalisé a refusé un appel d’outil.                                                                                                                                                             |
| `strategy`   | `string`                                                                                                                                                                                                                         | Selon la variante | Nom de la stratégie de contexte qui a réécrit l’historique.                                                                                                                                                             |
| `messages`   | `number`                                                                                                                                                                                                                         | Selon la variante | Nombre de messages de l’historique après compaction.                                                                                                                                                                    |
| `id`         | `string`                                                                                                                                                                                                                         | Selon la variante | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                                                                                                                                     |
| `value`      | `unknown`                                                                                                                                                                                                                        | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                                                                                      |

## Signature

```ts
export type AgentEvent =
  | {
      readonly kind: "phase";
      readonly name: string;
      readonly agent?: string;
      readonly branch?: string;
      readonly directory?: string;
    }
  | {
      readonly kind: "summary";
      readonly durationMs: number;
      readonly status: number;
      readonly tokens: Usage;
    }
  | {
      readonly kind: "warning";
      readonly message: string;
    }
  | {
      readonly kind: "text";
      readonly text: string;
    }
  | {
      readonly kind: "result";
      readonly text: string;
    }
  | {
      readonly kind: "prompt";
      readonly text: string;
    }
  | {
      readonly kind: "tool";
      readonly name: string;
      readonly input: unknown;
      readonly callId?: string;
    }
  | {
      readonly kind: "tool-result";
      readonly callId: string;
      readonly name: string;
      readonly isError: boolean;
      readonly preview: string;
      readonly characters: number;
    }
  | {
      readonly kind: "step";
      readonly index: number;
    }
  | {
      readonly kind: "tool-denied";
      readonly callId: string;
      readonly name: string;
      readonly reason: string;
    }
  | {
      readonly kind: "stop-prevented";
      readonly message: string;
    }
  | {
      readonly kind: "compaction";
      readonly strategy: string;
      readonly messages: number;
    }
  | {
      readonly kind: "conversation";
      readonly id: string;
    }
  | {
      readonly kind: "usage";
      readonly tokens: Usage;
    }
  | {
      readonly kind: "failure";
      readonly message: string;
    }
  | {
      readonly kind: "finished";
    }
  | {
      readonly kind: "raw";
      readonly value: unknown;
    };
```

## Contrats associés

- [Usage](../usage/)
