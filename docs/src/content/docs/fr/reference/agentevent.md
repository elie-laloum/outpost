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

| Nom          | Type                                                                                                                                             | Présence          | Rôle                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"phase" \| "summary" \| "warning" \| "text" \| "result" \| "prompt" \| "tool" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, result, prompt, tool, conversation, usage, failure, finished ou raw. |
| `name`       | `string`                                                                                                                                         | Selon la variante | Nom de phase pour les événements phase ou nom d’outil pour les événements tool.                                                                             |
| `agent`      | `string \| undefined`                                                                                                                            | Selon la variante | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex ou gemini.                                                                          |
| `branch`     | `string \| undefined`                                                                                                                            | Selon la variante | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                                      |
| `directory`  | `string \| undefined`                                                                                                                            | Selon la variante | Dossier hôte du workspace utilisé pour cette exécution.                                                                                                     |
| `durationMs` | `number`                                                                                                                                         | Selon la variante | Durée d’exécution écoulée en millisecondes.                                                                                                                 |
| `status`     | `number`                                                                                                                                         | Selon la variante | Code de sortie du processus ; zéro indique le succès.                                                                                                       |
| `tokens`     | `Usage`                                                                                                                                          | Selon la variante | Compteurs d’usage de tokens portés par un événement usage ou summary.                                                                                       |
| `message`    | `string`                                                                                                                                         | Selon la variante | Message d’avertissement ou d’échec décodé depuis l’événement d’agent.                                                                                       |
| `text`       | `string`                                                                                                                                         | Selon la variante | Texte porté par l’événement : texte diffusé, réponse finale ou prompt soumis selon kind.                                                                    |
| `input`      | `unknown`                                                                                                                                        | Selon la variante | Arguments bruts fournis à l’outil nommé par cet événement tool.                                                                                             |
| `id`         | `string`                                                                                                                                         | Selon la variante | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                                                                         |
| `value`      | `unknown`                                                                                                                                        | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                          |

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
