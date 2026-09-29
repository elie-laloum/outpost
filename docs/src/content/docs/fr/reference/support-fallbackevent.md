---
title: "FallbackEvent"
description: "FallbackEvent — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                        |
| ------------ | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"fallback"`          | Requis    | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, steer, compaction, conversation, usage, quota, fallback, failure, finished ou raw. |
| `from`       | `FallbackCandidate`   | Requis    | Candidat qui s’est arrêté dans un événement fallback : sa position, le nom de son adapter et le nom de son modèle s’il a été choisi.                                                                                                                        |
| `to`         | `FallbackCandidate`   | Requis    | Candidat qui prend le relais dans un événement fallback : sa position, le nom de son adapter et le nom de son modèle s’il a été choisi.                                                                                                                     |
| `failure`    | `FallbackTrigger`     | Requis    | Catégorie qui a arrêté le candidat précédent dans un événement fallback : quota ou unavailable.                                                                                                                                                             |
| `message`    | `string`              | Requis    | Message d’avertissement, d’échec ou de quota, échec ayant déclenché un repli, ou message qu’un hook stop a renvoyé au modèle.                                                                                                                               |
| `resetAt`    | `string \| undefined` | Optionnel | Horodatage ISO auquel un événement quota ou fallback indique la réinitialisation de la limite d’usage ou de débit ; présent uniquement lorsqu’il est fourni sous forme structurée.                                                                          |
| `subagentId` | `string \| undefined` | Optionnel | Identifiant de l’enfant intégré qui a émis l’événement ; absent pour le harness racine. Les événements de cycle de vie relient cet identifiant à l’appel d’outil de délégation.                                                                             |

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
