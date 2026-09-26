---
title: "HarnessToolEvent"
description: "HarnessToolEvent — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Hooks, permissions, conversations persistées et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                           | Présence          | Rôle                                                                                                                                                                           |
| --------- | ------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`    | `"warning" \| "text" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, result, prompt, tool, tool-result, step, conversation, usage, failure, finished ou raw. |
| `message` | `string`                       | Selon la variante | Message d’avertissement ou d’échec décodé depuis l’événement d’agent.                                                                                                          |
| `text`    | `string`                       | Selon la variante | Texte porté par l’événement : texte diffusé, réponse finale ou prompt soumis selon kind.                                                                                       |
| `value`   | `unknown`                      | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                                             |

## Signature

```ts
export type HarnessToolEvent = Extract<
  AgentEvent,
  {
    readonly kind: "text" | "warning" | "raw";
  }
>;
```

## Contrats associés

- [AgentEvent](../agentevent/)
