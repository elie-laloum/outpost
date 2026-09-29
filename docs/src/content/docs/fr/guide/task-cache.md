---
title: "Cache de résultats"
description: "Réutiliser le résultat JSON d’une tâche quand ses entrées n’ont pas changé, pour ne pas payer deux fois une même relecture ou analyse."
---

## Mettre une tâche en cache

Donnez à une tâche un `cache` avec un store, une `version` et une `key`. La seconde exécution trouve une entrée de même empreinte et restaure sa valeur sans exécuter la tâche.

```ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createLocalTransport,
  defineTask,
  createTaskCacheStore,
  defineWorkflow,
} from "@elie-laloum/outpost";

const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
const store = createTaskCacheStore({
  transporter: createLocalTransport({ directory }),
});
let executions = 0;
const summarize = () =>
  defineTask({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await defineWorkflow("release-notes", [summary]).start();
  result.unwrap();
  console.log(result.value(summary), result.tasks[0]?.cacheHit ?? false);
}
// { summary: '3 fixes', execution: 1 } false
// { summary: '3 fixes', execution: 1 } true
```

<!-- check:run -->

La seconde exécution restaure le premier résultat : `execution` reste à 1 et `cacheHit` vaut `true`.

## Choisir la clé

L’empreinte combine le nom du workflow, la clé de la tâche, `version` et la valeur JSON renvoyée par `key(ctx)`. Mettez-y tout ce qui peut changer la réponse.

| Entrée                                             | Où la placer                              |
| -------------------------------------------------- | ----------------------------------------- |
| État du dépôt, modifications locales comprises     | `await repositoryFingerprint(repository)` |
| Texte du brief ou du prompt                        | La clé                                    |
| Agent et modèle                                    | La clé                                    |
| Valeurs des dépendances                            | La clé, lues avec `ctx.value(task)`       |
| Code de la tâche, forme du résultat, configuration | `version` : changez-la quand ils changent |

```ts title="review.mts"
import {
  createLocalTransport,
  createTaskCacheStore,
  defineIsolatedTask,
  defineTask,
  repositoryFingerprint,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const brief = "Review the parser for unsafe input handling. Do not edit files.";
const store = createTaskCacheStore({
  transporter: createLocalTransport({
    directory: `${repository}/.outpost/storage`,
  }),
});
const reviewer = defineIsolatedTask({
  key: "reviewer",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: brief },
  }),
});
const review = defineTask({
  key: "review",
  cache: {
    store,
    version: "review-v1",
    key: async () => [await repositoryFingerprint(repository), brief, "codex"],
  },
  perform: async (ctx) => {
    const { text } = await reviewer.perform(ctx);
    return { text };
  },
});
```

`repositoryFingerprint()` calcule l’empreinte de `HEAD`, de l’index, des modifications non commitées et des fichiers non suivis non ignorés, hors `.outpost/` : une modification locale change donc la clé. Une clé qui lève une erreur ou n’est pas du JSON sans perte fait échouer la tâche.

## Savoir ce que restaure un hit

| Lors d’un hit                                                      | Résultat                                      |
| ------------------------------------------------------------------ | --------------------------------------------- |
| Valeur de la tâche                                                 | Restaurée et transmise aux tâches dépendantes |
| `TaskRecord.cacheHit`                                              | `true`                                        |
| Tentatives, usage, budget de tentatives                            | Rien d’enregistré ni de consommé              |
| Fichiers, commits, branches, état de la sandbox, artefacts, appels | Non rejoués                                   |

Mettez en cache les tâches dont la valeur est le produit : relectures, classifications, résumés, analyses.

## Choisir une tâche qui accepte un cache

Le résultat doit être du JSON sans perte ou `undefined` ; sinon, la tâche échoue après son exécution, sans nouvelle tentative.

| Tâche                                                                                                                                           | `cache`                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`defineTask`](../../reference/definetask/) et les fonctions construites dessus (`defineCommandTask`, `defineArtifactTask`, `defineQueuedTask`) | Oui                                                                          |
| [`defineLoopTask`](../../reference/definelooptask/)                                                                                             | Oui : un hit saute tous les tours                                            |
| `defineAgentTask`, `defineIsolatedTask`                                                                                                         | Non : appelez-la depuis un `defineTask` qui renvoie du JSON, comme ci-dessus |
| Gates (`defineApprovalTask`, `definePauseTask`) et tâches interactives                                                                          | Non                                                                          |

## Expirer ou rafraîchir les entrées

| Option                 | Effet                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `maxAgeMs: 86_400_000` | Une entrée de plus d’un jour est un miss ; la tâche s’exécute et la remplace.                           |
| `mode: "refresh"`      | Saute la lecture, exécute la tâche et remplace son entrée, par exemple après une mise à jour de modèle. |

## Suivre les événements du cache

```ts
import type { Workflow } from "@elie-laloum/outpost";

declare const workflow: Workflow;

await workflow.start({
  observe: (event) => {
    if (event.type === "cache")
      console.log(event.key, event.cache, event.error);
  },
});
```

| `event.cache` | Signification                                                                       |
| ------------- | ----------------------------------------------------------------------------------- |
| `hit`         | La valeur a été restaurée.                                                          |
| `miss`        | Aucune entrée utilisable : absente, expirée ou `mode: "refresh"`.                   |
| `stored`      | Le résultat a été écrit après la réussite de la tâche.                              |
| `failed`      | Le store a échoué ou une entrée était invalide ; `event.error` contient le message. |

Le cache ne décide jamais du résultat : après une lecture `failed`, la tâche s’exécute ; après une écriture `failed`, elle se termine normalement.

## Protéger et purger les entrées

:::caution
Les entrées ne sont pas authentifiées : quiconque peut écrire dans le transport contrôle les valeurs que vos tâches restaurent. Utilisez un transport au moins aussi fiable que le dépôt.
:::

Les entrées restent sous `task-cache/` dans le transport jusqu’à ce que vous les supprimiez. Ajoutez le périmètre `task-cache` à une [politique de rétention](../retention/) pour purger celles plus anciennes que `minAgeMs`.

## Limites

- Les exécutions concurrentes de même empreinte s’exécutent toutes ; la première entrée écrite est conservée.
- Une tâche déjà terminée dans un [checkpoint](../durable-runs/) en est restaurée sans lire le cache.
- Les entrées ne sont pas invalidées quand votre code ou votre agent change : changez `version`.
- `createTaskCacheStore` n’enregistre pas les entrées de plus de 16 Mio (`maxBytes`) ; l’écriture signale `failed`.

API : [TaskCacheOptions](../../reference/taskcacheoptions/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/) · [WorkflowEvent](../../reference/workflowevent/).
