---
title: "serveTriggers"
description: "serveTriggers — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { serveTriggers } from "@elie-laloum/outpost";
```

## Rôle et comportement

Démarre un serveur HTTP qui vérifie chaque requête avec la source de sa route et publie le job choisi par on() sous trigger:<path>:<delivery>. Les relivraisons d’une même livraison ne publient rien de nouveau. Il répond 202, 204, 401, 404, 405, 413, 500 ou 503, sauf si la source remplace les réponses de succès, et se résout une fois à l’écoute. L’appelant ferme le serveur puis sa file.

[Exemple complet et règles détaillées](../../guide/triggers/).

## Paramètres et propriétés

| Nom                | Type                                                               | Présence  | Rôle                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`          | `TriggerServerOptions`                                             | Requis    | File, routes, adresse d’écoute, limite de corps et observateur d’échecs.                                                                                                                            |
| `options.queue`    | `TaskQueue`                                                        | Requis    | File qui reçoit les jobs ; une publication refusée répond 503.                                                                                                                                      |
| `options.routes`   | `readonly TriggerRoute[]`                                          | Requis    | Au moins une route avec un chemin unique.                                                                                                                                                           |
| `options.host`     | `string \| undefined`                                              | Optionnel | Adresse d’écoute ; 127.0.0.1 par défaut. Exposez le serveur derrière un proxy qui termine TLS.                                                                                                      |
| `options.port`     | `number \| undefined`                                              | Optionnel | Port d’écoute ; 0 ou l’absence choisit un port libre indiqué dans url.                                                                                                                              |
| `options.maxBytes` | `number \| undefined`                                              | Optionnel | Limite du corps de requête en octets ; 1 Mio par défaut, au plus 25 Mio. Les corps plus grands répondent 413.                                                                                       |
| `options.onError`  | `((error: unknown, failure: TriggerFailure) => void) \| undefined` | Optionnel | Observe les échecs de vérification, de routage et de publication avec le chemin et, après vérification, la livraison ; ne reçoit jamais de secrets. Les erreurs levées par le rappel sont ignorées. |

## Retour

`Promise<TriggerServer>`

## Signature

```ts
export declare function serveTriggers(
  options: TriggerServerOptions,
): Promise<TriggerServer>;
```

## Contrats associés

- [TriggerServer](../triggerserver/)
- [TriggerServerOptions](../triggerserveroptions/)
