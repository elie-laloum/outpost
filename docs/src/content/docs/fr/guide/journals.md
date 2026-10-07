---
title: "Lire les journaux d’exécution"
description: "Enregistrez les événements d’agent et consultez le journal d’une tâche terminée ou en échec."
---

Utilisez les [rapports de run](../run-reports/) pour enregistrer un résumé du dispatch avec fichiers commités, échecs observés, durée et usage déclaré. Les rapports restent disponibles après le nettoyage du workspace.

## Enregistrer un journal

Chaque tâche d’agent enregistre ses événements dans un journal par défaut. Définissez `logging.transporter` pour choisir son emplacement, puis utilisez `readJournal()` pour consulter les événements après l’exécution.

<!-- tabs -->

```ts title="record-journal.ts"
import { createLocalTransport, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
```

```ts title="read-journal.ts"
import { reportValue } from "./reporter.ts";
import { result, transporter } from "./record-journal.ts";
import { readJournal } from "@elie-laloum/outpost";

if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  reportValue(events.length);
  // Example output: 12
}
```

`result.logReference` désigne le journal terminé. Sans `logging`, Outpost l’écrit dans un transport local sous `<repository>/.outpost/storage`. Pour conserver les journaux ailleurs, passez un autre transport : voir [Où vivent les données](../storage/) et [S3 et R2](../object-storage/).

## Choisir ce qui est enregistré

Référence API : [Logging](../../reference/logging/).

Les options de l’objet se combinent : `{ transporter, verbose: true, replayable: true }`. Une [session de sandbox](../sandbox-sessions/) reçoit `logging` une fois pour tous ses dispatchs, et chaque `sandbox.dispatch()` peut le remplacer.

## Relire un journal

`readJournal()` renvoie les événements dans l’ordre où ils se sont produits. Chaque entrée est un objet simple : les champs de l’événement avec son `kind`, plus `at`, `seq`, `source`, `scope` et le `label` du dispatch si vous en avez défini un.

Référence API : [ReadJournalOptions](../../reference/readjournaloptions/).

La lecture échoue si le journal dépasse les limites configurées ; elle ne renvoie pas une transcription tronquée.

```ts
import { createLocalTransport, readJournal } from "@elie-laloum/outpost";
import type { TransportReference } from "@elie-laloum/outpost";

declare const reference: TransportReference;

const events = await readJournal({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
  reference,
  maxEntries: 5_000,
  maxBytes: 8 * 1024 * 1024,
});
```

## Comprendre les événements enregistrés

Référence API : [ObservationEvent](../../reference/observationevent/) et [AgentObservation](../../reference/agentobservation/).

`dispatch-finished` porte le `status` (`done`, `failed` ou `cancelled`), `completed`, l’`usage` en tokens, la branche et les commits, ainsi que le code et le message de l’`error` en cas d’échec. Les événements `operation` portent leur `durationMs`.

Le [harness intégré](../harness/) n’émet `model-request` et `model-response` que sur un hub verbeux. Pour enregistrer les échanges complets avec le modèle, passez-en un avec un journal `verbose` :

```ts
import { createObservationHub, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const observation = createObservationHub({ verbose: true });
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  observation,
  logging: { verbose: true },
});
await observation.close();
```

## Enregistrer une exécution pour la rejouer

`logging: { replayable: true }` stocke chaque commit du dispatch sous forme de patch binaire vérifié. `createReplayAgent()` rejoue ensuite le journal sans appeler de modèle : voir [Rejouer sans modèle](../record-replay/).

## Retrouver le journal d’un dispatch en échec

Un dispatch en échec ou annulé ferme quand même son journal par `dispatch-finished`, y compris lorsque la préparation échoue. L’erreur porte la référence : lisez-la avec `recoveryDetails()`.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Fix the failing tests and commit the fix." },
  });
} catch (error) {
  console.error(recoveryDetails(error)?.logReference);
  throw error;
}
```

[Erreurs](../error-handling/) présente les autres informations de récupération.

## Supprimer les anciens journaux

Les journaux restent dans leur transport jusqu’à ce que vous les supprimiez. Une politique de rétention avec la portée `closed-logs` supprime les journaux fermés au-delà d’un âge donné : voir [Rétention et nettoyage](../retention/).

## Limites

- Un journal est écrit par un récepteur du [hub d’observation](../observability/). Il partage la file limitée du hub (`capacity`, `deliveryTimeoutMs`) : si son transport échoue ou prend du retard, le journal peut manquer des événements, être désactivé pour le reste de l’exécution ou rester ouvert, et l’échec apparaît dans `result.observerErrors` (dans `recoveryDetails(error)` quand le dispatch échoue). `readJournal()` renvoie alors les événements écrits avant l’échec.
- Les journaux contiennent les prompts, les messages de l’agent et les résultats d’outils, donc du contenu du dépôt. Stockez-les et partagez-les avec le même soin que le code ; `replayable` y ajoute les patchs de chaque commit.

API : [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [ReadJournalOptions](../../reference/readjournaloptions/) · [DispatchResult](../../reference/dispatchresult/) · [recoveryDetails](../../reference/recoverydetails/) · [createObservationHub](../../reference/createobservationhub/).
