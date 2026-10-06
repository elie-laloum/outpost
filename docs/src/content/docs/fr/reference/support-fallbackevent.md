---
title: "FallbackEvent"
description: "FallbackEvent — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"fallback"`          | Requis    | Type d’événement qui sélectionne la charge utile : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-output, tool-denied, file-change, reasoning, step, hook, instructions-loaded, skills-loaded, model-route, model-request, model-response, model-retry, model-error, stop-prevented, steer, compaction, subagent, conversation, usage, message-usage, quota, fallback, stderr, stopped, failure, finished or raw. |
| `from`       | `FallbackCandidate`   | Requis    | Candidat qui s’est arrêté dans un événement fallback : sa position, le nom de son adapter et le nom de son modèle s’il a été choisi.                                                                                                                                                                                                                                                                                                                  |
| `to`         | `FallbackCandidate`   | Requis    | Candidat qui prend le relais dans un événement fallback : sa position, le nom de son adapter et le nom de son modèle s’il a été choisi.                                                                                                                                                                                                                                                                                                               |
| `failure`    | `FallbackTrigger`     | Requis    | Catégorie qui a arrêté le candidat précédent dans un événement fallback : quota ou unavailable.                                                                                                                                                                                                                                                                                                                                                       |
| `message`    | `string`              | Requis    | Message d’un événement warning, failure, quota, fallback, model-retry ou model-error, ou message renvoyé au modèle par un hook d’arrêt sur stop-prevented.                                                                                                                                                                                                                                                                                            |
| `resetAt`    | `string \| undefined` | Optionnel | Horodatage ISO auquel un événement quota ou fallback indique la réinitialisation de la limite d’usage ou de débit ; présent uniquement lorsqu’il est fourni sous forme structurée.                                                                                                                                                                                                                                                                    |
| `subagentId` | `string \| undefined` | Optionnel | Identifiant de l’enfant intégré qui a émis l’événement ; absent pour le harness racine. Les événements de cycle de vie relient cet identifiant à l’appel d’outil de délégation.                                                                                                                                                                                                                                                                       |

## Signature

```ts
export type FallbackEvent = Extract<
  AgentEvent,
  {
    readonly kind: "fallback";
  }
>;
```

## Contrats associés

- [AgentEvent](../agentevent/)
