---
title: "Gérer les observateurs lents ou défaillants"
description: "Vérifiez les pertes d’événements et les erreurs lorsqu’un observateur effectue un traitement asynchrone."
---

Vérifiez les pertes d’événements et les erreurs lorsqu’un observateur effectue un traitement asynchrone.

## Vérifier qu’un observateur ne bloque pas le travail

Cet exemple hors ligne rend toujours `hello`, même si le récepteur refuse chaque événement. Exécutez-le avec Node.js 24 ; il affiche `done true`.

```ts
import assert from "node:assert/strict";
import {
  createObservationHub,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const observation = createObservationHub({
  sinks: [
    {
      observe() {
        throw new Error("Receiver unavailable");
      },
    },
  ],
});
const task = defineTask({ key: "greet", perform: () => "hello" });
const result = await defineWorkflow("observer-failure", [task]).start({
  observation,
});
await observation.close();
assert.equal(result.value(task), "hello");
console.log(result.status, observation.errors.length > 0);
```

<!-- check:run -->

## Livraison et erreurs

Un récepteur qui ne renvoie rien s’exécute pendant l’émission : gardez-le rapide. Un récepteur qui renvoie une promesse dispose de sa propre file ordonnée. Le `flush()` facultatif d’un récepteur s’exécute chaque fois que le hub se vide.

| Situation                                                   | Conséquence                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| La file d’un récepteur contient déjà `capacity` événements. | Les nouveaux événements pour ce récepteur sont perdus et `dropped` augmente.              |
| Une livraison dépasse `deliveryTimeoutMs`.                  | Le récepteur est désactivé. Sa promesse en cours continue de s’exécuter.                  |
| Un récepteur lève une exception ou rejette.                 | L’erreur rejoint `errors` et les `observerErrors` de l’exécution, qui n’est pas affectée. |

`dispatch()` et `start()` vident leurs livraisons avant de rendre la main. `flush()` vide le hub à tout moment ; `close()` le vide et cesse d’accepter des événements.

<!-- tabs -->

```ts title="slow-observer.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  deliveryTimeoutMs: 2_000,
  sinks: [
    {
      async observe({ seq, event }) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        console.log(seq, event.kind);
        // Example output: 1 workflow
      },
    },
  ],
});
```

```ts title="delivery.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { observation } from "./slow-observer.ts";

export const greet = defineTask({ key: "greet", perform: () => "hello" });
export const result = await defineWorkflow("greet", [greet]).start({
  observation,
});
await observation.close();
console.log(result.status, observation.dropped, observation.errors.length);
// Example output: done 0 0
```

<!-- check:run -->

Le récepteur affiche les événements `workflow` numérotés, puis le script affiche `done 0 0`. Vérifiez `dropped` et `errors` avant de considérer une trace comme complète.

## Traiter une sortie trop volumineuse

Une ligne de protocole de plus de 16 Mio arrête un agent CLI. Le hub et `observe` reçoivent un événement `raw` avec ses 2 000 premiers caractères, `bytes` et `truncated: true`, puis `stopped` avec la raison `oversized-event`. Le dispatch échoue avec le code `process` ([Erreurs](../error-handling/)).

## Traiter les événements d’agent de façon asynchrone

`createCustomReporter()` construit une fonction de rappel `observe` à partir de traitements indexés par type d’événement. Les traitements peuvent être asynchrones ; ils passent par une file limitée, comme les récepteurs du hub.

```ts
import { appendFile } from "node:fs/promises";
import { createCustomReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const report = createCustomReporter({
  async tool(event) {
    await appendFile("tools.log", `${event.at} ${event.name}\n`);
  },
});
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: report,
});
await report.flush();
```

Le dispatch attend les traitements en cours avant de rendre la main et signale la première erreur de traitement dans `result.observerErrors`. `report.flush()` relance cette erreur. Le second argument accepte `onError`, appelé à chaque échec, ainsi que `capacity` et `deliveryTimeoutMs` pour la file.

## Limites

- Le hub est un flux en mémoire et en direct : il ne stocke rien, et un récepteur lent perd des événements. Pour relire les événements après l’exécution, utilisez le [journal](../journals/) du dispatch, lui-même un récepteur soumis aux mêmes limites `capacity` et `deliveryTimeoutMs`.
- Un récepteur désactivé le reste pendant toute la vie du hub, et `errors` conserve les 100 premières erreurs.
- Un hub fermé ignore les nouveaux événements. Un hub réutilisé entre plusieurs exécutions conserve ses `errors` et son compteur `dropped` : les `observerErrors` de chaque exécution incluent alors les erreurs précédentes.
- Les événements émis sur un [worker](../job-queues/) distant restent sur le hub de ce worker.

API : [Options de livraison](../../reference/observationhuboptions/) · [Cycle de vie et compteurs](../../reference/observationhub/) · [Reporter personnalisé](../../reference/createcustomreporter/).
