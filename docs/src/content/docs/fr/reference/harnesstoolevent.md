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

| Nom          | Type                           | Présence          | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"warning" \| "text" \| "raw"` | Requis            | Type d’événement qui sélectionne la charge utile : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-output, tool-denied, file-change, reasoning, step, hook, instructions-loaded, skills-loaded, model-request, model-response, model-retry, model-error, stop-prevented, steer, compaction, subagent, conversation, usage, message-usage, quota, fallback, stderr, stopped, failure, finished or raw. |
| `message`    | `string`                       | Selon la variante | Message d’un événement warning, failure, quota, fallback, model-retry ou model-error, ou message renvoyé au modèle par un hook d’arrêt sur stop-prevented.                                                                                                                                                                                                                                                                               |
| `subagentId` | `string \| undefined`          | Optionnel         | Identifiant de l’enfant intégré qui a émis l’événement ; absent pour le harness racine. Les événements de cycle de vie relient cet identifiant à l’appel d’outil de délégation.                                                                                                                                                                                                                                                          |
| `text`       | `string`                       | Selon la variante | Texte de l’événement selon kind : texte de l’agent, fragment diffusé, réponse finale, prompt rendu, consigne de steering, raisonnement, ligne de stderr ou morceau de sortie d’outil.                                                                                                                                                                                                                                                    |
| `value`      | `unknown`                      | Selon la variante | Ligne brute du protocole telle que l’agent l’a écrite ; pour une ligne trop grande, seulement ses 2000 premiers caractères.                                                                                                                                                                                                                                                                                                              |
| `bytes`      | `number \| undefined`          | Selon la variante | Taille UTF-8 constatée d’une ligne de protocole trop volumineuse ou du préfixe reçu avant l’arrêt.                                                                                                                                                                                                                                                                                                                                       |
| `truncated`  | `boolean \| undefined`         | Selon la variante | Indique si le fragment stderr ou l’aperçu brut trop volumineux a été borné avant livraison.                                                                                                                                                                                                                                                                                                                                              |

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
