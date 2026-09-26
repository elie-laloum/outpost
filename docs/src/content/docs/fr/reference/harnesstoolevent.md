---
title: "HarnessToolEvent"
description: "HarnessToolEvent — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessToolEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                           | Présence          | Rôle                                                                                                                                                                                                                                |
| --------- | ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`    | `"warning" \| "text" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished ou raw. |
| `message` | `string`                       | Selon la variante | Message d’avertissement ou d’échec, ou message qu’un hook stop a renvoyé au modèle.                                                                                                                                                 |
| `text`    | `string`                       | Selon la variante | Texte porté par l’événement : fragment diffusé, texte diffusé, réponse finale ou prompt soumis selon la variante.                                                                                                                   |
| `value`   | `unknown`                      | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                                                                                                  |

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
