---
title: "Cache de tâches"
description: "Réutiliser le résultat JSON d’une tâche au lieu de la réexécuter avec les mêmes entrées."
---

Disponible depuis la 8.0.0. Une tâche dotée d’un `cache` calcule l’empreinte de ses entrées et enregistre son résultat JSON dans un Transport. Une exécution ultérieure avec la même empreinte restaure ce résultat au lieu de lancer la tâche : une relecture ou une analyse répétée n’est pas payée deux fois.

```ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localTransport,
  task,
  taskCacheStore,
  workflow,
} from "@elie-laloum/outpost";

const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
const store = taskCacheStore({ transporter: localTransport({ directory }) });
let executions = 0;
const summarize = () =>
  task({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await workflow("release-notes", [summary]).start();
  result.unwrap();
  console.log(result.value(summary), result.tasks[0]?.cacheHit ?? false);
}
// { summary: '3 fixes', execution: 1 } false
// { summary: '3 fixes', execution: 1 } true
```

<!-- check:run -->

## Choisir la clé

`key(ctx)` renvoie les entrées JSON sans perte qui déterminent le résultat. L’empreinte les combine avec le nom du workflow, la clé de la tâche et `version`. L’ordre des clés d’objet n’a pas d’importance. Le callback s’exécute avant chaque exécution avec `attempt` à 0 et peut lire les dépendances déclarées avec `ctx.value()`. Une exception, ou une valeur qui n’est pas du JSON sans perte, fait échouer la tâche.

Incluez tout ce qui peut changer la réponse : l’état du dépôt, le brief, l’agent et le modèle, et les valeurs de dépendances utiles. `repositoryFingerprint()` calcule l’empreinte de `HEAD`, des modifications suivies, de l’index et des fichiers non suivis (hors `.outpost/`) : une modification non commitée change donc la clé. Un identifiant de commit seul réutiliserait un résultat calculé pour un autre arbre de travail.

```ts
import {
  agentTask,
  localTransport,
  repositoryFingerprint,
  task,
  taskCacheStore,
} from "@elie-laloum/outpost";
import type { Sandbox } from "@elie-laloum/outpost";

declare const session: Sandbox;
const repository = "/projects/app";
const brief = "Review the parser for unsafe input handling.";
const store = taskCacheStore({
  transporter: localTransport({ directory: `${repository}/.outpost/storage` }),
});
const reviewer = agentTask({
  key: "reviewer",
  sandbox: session,
  request: () => ({ brief: { text: brief } }),
});
const review = task({
  key: "review",
  cache: {
    store,
    version: "review-v1",
    key: async () => [
      await repositoryFingerprint(repository),
      brief,
      "claude-sonnet-5",
    ],
  },
  async perform(ctx) {
    const result = await reviewer.perform(ctx);
    return { text: result.text };
  },
});
```

`version` est obligatoire. Changez-la lorsque l’implémentation de la tâche, la configuration de l’agent, le prompt ou le contrat de sortie change. Outpost n’invalide pas les entrées lors d’une mise à jour ou d’un changement de code qu’il ne peut pas voir.

## Ce que restaure une correspondance

Une correspondance restaure uniquement la valeur enregistrée. Elle n’enregistre ni tentative ni usage, ne consomme pas de budget de tentatives et positionne `TaskRecord.cacheHit`. Les tâches dépendantes reçoivent la valeur restaurée comme d’habitude.

Rien d’autre n’est rejoué : ni fichiers, ni commits, ni branches, ni état de sandbox, ni artefacts, ni appels externes. Ne mettez en cache que les tâches dont la valeur est le produit : relectures, classifications, résumés ou analyses. Une valeur en cache qui cite un commit ne place pas ce commit sur votre branche courante.

Les résultats doivent être du JSON sans perte ou `undefined`. Sinon, la tâche échoue après son exécution, sans nouvelle tentative. `agentTask` et `isolatedTask` refusent `cache`, car leur résultat de dispatch n’est pas du JSON ; mettez en cache une tâche qui renvoie une projection, comme ci-dessus. Les gates et les tâches interactives le refusent aussi. `loopTask` accepte `cache` : une correspondance saute tous les tours.

## Expiration et rafraîchissement

`maxAgeMs` traite une entrée plus ancienne comme un miss ; la tâche s’exécute et la remplace. `mode: "refresh"` ignore les entrées existantes, exécute la tâche et remplace son entrée, par exemple pour repeupler le cache après une mise à jour de modèle.

## Échecs et événements

Chaque tâche en cache émet un `WorkflowEvent` de `type: "cache"`, avec `cache` à `hit`, `miss`, `stored` ou `failed`. Les consommateurs exhaustifs des événements doivent gérer ce type.

Le cache ne décide jamais du résultat de la tâche. Si le store est illisible, si une entrée est corrompue ou appartient à une autre empreinte, ou si le résultat ne peut pas être écrit, l’événement vaut `failed` avec un message `error`, et la tâche s’exécute ou se termine normalement. L’annulation annule toujours la tâche.

Il n’y a pas de coordination entre exécutions concurrentes : celles qui partagent une empreinte s’exécutent toutes, et la première entrée écrite est conservée. Avec les [checkpoints](../durable-runs/), une tâche terminée est restaurée depuis le checkpoint sans consulter le cache, et `cacheHit` est persisté avec son enregistrement.

## Confiance et rétention

Les entrées ne sont ni signées ni authentifiées. Quiconque peut écrire dans le transport contrôle les valeurs que les tâches restaurent. Utilisez un transport au moins aussi fiable que le dépôt et ne le partagez pas au-delà d’une frontière de confiance. Les entrées contiennent des sorties de tâches, qui peuvent être sensibles.

`taskCacheStore` stocke les entrées sous `task-cache/<empreinte>.json`. Elles sont conservées jusqu’à leur suppression : ajoutez le périmètre `task-cache` à une [politique de rétention](../retention-rules/) pour supprimer les entrées plus anciennes que `minAgeMs`.

API : [TaskCacheOptions](../../reference/taskcacheoptions/) · [taskCacheStore](../../reference/taskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/).
