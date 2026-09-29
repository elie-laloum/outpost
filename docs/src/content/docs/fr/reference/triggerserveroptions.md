---
title: "TriggerServerOptions"
description: "TriggerServerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerServerOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                               | Présence  | Rôle                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                                                        | Requis    | File qui reçoit les jobs ; une publication refusée répond 503.                                                                                                                                      |
| `routes`   | `readonly TriggerRoute[]`                                          | Requis    | Au moins une route avec un chemin unique.                                                                                                                                                           |
| `host`     | `string \| undefined`                                              | Optionnel | Adresse d’écoute ; 127.0.0.1 par défaut. Exposez le serveur derrière un proxy qui termine TLS.                                                                                                      |
| `port`     | `number \| undefined`                                              | Optionnel | Port d’écoute ; 0 ou l’absence choisit un port libre indiqué dans url.                                                                                                                              |
| `maxBytes` | `number \| undefined`                                              | Optionnel | Limite du corps de requête en octets ; 1 Mio par défaut, au plus 25 Mio. Les corps plus grands répondent 413.                                                                                       |
| `onError`  | `((error: unknown, failure: TriggerFailure) => void) \| undefined` | Optionnel | Observe les échecs de vérification, de routage et de publication avec le chemin et, après vérification, la livraison ; ne reçoit jamais de secrets. Les erreurs levées par le rappel sont ignorées. |

## Signature

```ts
export interface TriggerServerOptions {
  readonly queue: TaskQueue;
  readonly routes: readonly TriggerRoute[];
  /** Defaults to 127.0.0.1; expose through a TLS-terminating proxy. */
  readonly host?: string;
  readonly port?: number;
  /** Request body limit; defaults to 1 MiB, at most 25 MiB. */
  readonly maxBytes?: number;
  /** Observes rejected or failed requests; never receives secrets. */
  readonly onError?: (error: unknown, failure: TriggerFailure) => void;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
- [TriggerFailure](../triggerfailure/)
- [TriggerRoute](../triggerroute/)
