---
title: "Journaux"
description: "Conserver un enregistrement durable de chaque dispatch et relire ses événements après l’exécution."
---

## Enregistrer un journal

Chaque dispatch écrit un journal par défaut. Passez un transport dans `logging` pour choisir où il est stocké, puis relisez-le avec `readJournal()`.

```ts
import {
  createLocalTransport,
  dispatch,
  readJournal,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  console.log(events.length);
}
```

`result.logReference` désigne le journal terminé. Sans `logging`, Outpost l’écrit dans un transport local sous `<repository>/.outpost/storage`. Pour conserver les journaux ailleurs, passez un autre transport : voir [Où vivent les données](../storage/) et [S3 et R2](../object-storage/).

## Choisir ce qui est enregistré

| `logging`              | Ce qu’Outpost enregistre                                         | `logReference` |
| ---------------------- | ---------------------------------------------------------------- | -------------- |
| omis                   | Un journal sous `<repository>/.outpost/storage`                  | Oui            |
| `{ transporter }`      | Un journal dans ce transport                                     | Oui            |
| `{ verbose: true }`    | En plus, les événements bruts et en flux                         | Oui            |
| `{ replayable: true }` | En plus, chaque commit sous forme de patch, pour le rejeu        | Oui            |
| `"stdout"`             | Aucun journal ; lignes de progression affichées dans le terminal | Non            |
| `false`                | Rien                                                             | Non            |

Les options de l’objet se combinent : `{ transporter, verbose: true, replayable: true }`. Une [session de sandbox](../sandbox-sessions/) reçoit `logging` une fois pour tous ses dispatchs, et chaque `sandbox.dispatch()` peut le remplacer.

## Relire un journal

`readJournal()` renvoie les événements dans l’ordre où ils se sont produits. Chaque entrée est un objet simple : les champs de l’événement avec son `kind`, plus `at`, `seq`, `source`, `scope` et le `label` du dispatch si vous en avez défini un.

`maxEntries` (100 000 par défaut) et `maxBytes` (64 Mio par défaut) bornent une lecture. Un journal qui dépasse l’une de ces limites échoue à la lecture au lieu d’être tronqué.

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

## Savoir ce que contient un journal

| Enregistré              | Événements                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toujours                | `dispatch-start`, les événements `phase` et `operation` de la préparation au nettoyage, les [événements de l’agent](../progress/) (`prompt`, `text`, `tool`, `tool-result`, `usage`…), puis `dispatch-finished`. |
| Avec `verbose: true`    | Les lignes de protocole `raw`, `text-delta`, `stderr`, `reasoning`, `tool-output`, `command-output`, `model-request` et `model-response`.                                                                        |
| Avec `replayable: true` | Un événement `workspace-commits` à la fin de chaque dispatch en sandbox.                                                                                                                                         |

`dispatch-finished` porte le `status` (`done`, `failed` ou `cancelled`), `completed`, l’`usage` en tokens, la branche et les commits, ainsi que le code et le message de l’`error` en cas d’échec. Les événements `operation` portent leur `durationMs`.

Le [harness intégré](../harness/) n’émet `model-request` et `model-response` que sur un hub verbeux. Pour enregistrer les échanges complets avec le modèle, passez-en un avec un journal `verbose` :

```ts
import { createObservationHub, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

- Un journal est écrit par un récepteur du [hub d’observation](../observability/). Si son transport échoue ou prend du retard, le journal peut manquer des événements ou rester ouvert, et l’échec apparaît dans `result.observerErrors` (dans `recoveryDetails(error)` quand le dispatch échoue). `readJournal()` renvoie alors les événements écrits avant l’échec.
- Les journaux contiennent les prompts, les messages de l’agent et les résultats d’outils, donc du contenu du dépôt. Stockez-les et partagez-les avec le même soin que le code ; `replayable` y ajoute les patchs de chaque commit.

API : [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [ReadJournalOptions](../../reference/readjournaloptions/) · [DispatchResult](../../reference/dispatchresult/) · [recoveryDetails](../../reference/recoverydetails/) · [createObservationHub](../../reference/createobservationhub/).
