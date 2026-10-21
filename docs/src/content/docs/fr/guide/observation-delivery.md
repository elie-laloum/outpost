---
title: "Gérer les observateurs lents ou défaillants"
description: "Vérifiez les pertes d’événements et les erreurs lorsqu’un observateur effectue un traitement asynchrone."
---

Vérifiez les pertes d’événements et les erreurs lorsqu’un observateur effectue un traitement asynchrone.

## Vérifier qu’un observateur ne bloque pas le travail

Cet exemple hors ligne rend toujours `hello`, même si le récepteur refuse chaque événement. Exécutez-le avec Node.js 24 ; il affiche `done true`.

```ts
import assert from "node:assert/strict";
import { createObservation } from "@elie-laloum/outpost/core";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost/workflows";

const observation = createObservation({
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

`dispatch()` et `start()` vident leurs livraisons avant de rendre la main. `observation.flush()` vide les livraisons actuelles, y compris celles des suivis persistés actifs. `observation.close()` refuse les nouvelles exécutions, attend les suivis actifs sans les annuler, puis ferme la livraison. Sorties et transports restent empruntés.

<!-- tabs -->

```ts title="slow-observer.ts"
import { createObservation } from "@elie-laloum/outpost/core";

export const observation = createObservation({
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
import { defineTask, defineWorkflow } from "@elie-laloum/outpost/workflows";
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

`createCustomReporter()` construit une sortie à partir de traitements indexés par type d’événement d’agent ; il reste aussi appelable comme callback `observe`. Les traitements peuvent être asynchrones ; ils passent par une file limitée, comme les récepteurs du hub.

```ts
import { appendFile } from "node:fs/promises";
import { createObservation, dispatch } from "@elie-laloum/outpost/core";
import { createCustomReporter } from "@elie-laloum/outpost/observation";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const report = createCustomReporter({
  async tool(event) {
    await appendFile("tools.log", `${event.at} ${event.name}\n`);
  },
});
await using observation = createObservation({ sinks: [report] });
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observation,
});
await report.flush();
```

Le dispatch attend les traitements en cours avant de rendre la main et signale la première erreur de traitement dans `result.observerErrors`. `report.flush()` relance cette erreur. Le second argument accepte `onError`, appelé à chaque échec, ainsi que `capacity` et `deliveryTimeoutMs` pour la file.

La fermeture du destinataire d’exécution possédé est aussi bornée par `deliveryTimeoutMs`. Un transport bloqué ne retient pas indéfiniment le nettoyage final de l’exécution. Ce délai n’annule pas une écriture en cours sur le transport emprunté ; examinez les erreurs d’observation et laissez son propriétaire gérer les entrées-sorties restantes.

## Limites

- La livraison utilise des files bornées en mémoire. Configurez `transporter` sur `createObservation()` pour enregistrer [l’état des exécutions](../run-state/), ou lisez le [journal](../journals/) du dispatch. Ces deux chemins de persistance peuvent perdre des événements si leurs destinataires prennent du retard.
- Un destinataire désactivé le reste pendant sa session de livraison. Chaque hub limite son historique à 100 erreurs ; le client conserve aussi un historique borné des suivis persistés terminés.
- Les exécutions persistées ont leurs propres sessions et séquences d’événements ; le client agrège leurs erreurs et pertes. Sans persistance, le hub partagé conserve ses compteurs et son état de livraison entre exécutions. Un hub fermé ignore les émissions ; un client fermé refuse les nouvelles exécutions.
- Les événements émis sur un [worker](../job-queues/) distant restent sur le hub de ce worker.

API : [Options de livraison](../../reference/observationoptions/) · [Cycle de vie et compteurs](../../reference/observationclient/) · [Reporter personnalisé](../../reference/createcustomreporter/).
