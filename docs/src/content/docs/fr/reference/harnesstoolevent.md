---
title: "HarnessToolEvent"
description: "HarnessToolEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessToolEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                           | Présence          | Rôle                                                                                                                                                                                                                                |
| ------------ | ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"warning" \| "text" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished ou raw. |
| `message`    | `string`                       | Selon la variante | Message d’avertissement ou d’échec, ou message qu’un hook stop a renvoyé au modèle.                                                                                                                                                 |
| `subagentId` | `string \| undefined`          | Optionnel         | Identifiant de l’enfant intégré qui a émis l’événement ; absent pour le harness racine. Les événements de cycle de vie relient cet identifiant à l’appel d’outil de délégation.                                                     |
| `text`       | `string`                       | Selon la variante | Texte porté par l’événement : fragment diffusé, texte diffusé, réponse finale ou prompt soumis selon la variante.                                                                                                                   |
| `value`      | `unknown`                      | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                                                                                                  |
| `bytes`      | `number \| undefined`          | Selon la variante | Taille UTF-8 constatée d’une ligne de protocole trop volumineuse ou du préfixe reçu avant l’arrêt.                                                                                                                                  |
| `truncated`  | `boolean \| undefined`         | Selon la variante | Indique si le fragment stderr ou l’aperçu brut trop volumineux a été borné avant livraison.                                                                                                                                         |

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
