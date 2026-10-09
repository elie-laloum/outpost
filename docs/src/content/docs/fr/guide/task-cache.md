---
title: "Réutiliser les résultats des tâches"
description: "Mettez en cache les sorties JSON lorsqu’une tâche peut réutiliser un résultat pour les mêmes entrées."
---

## Mettre une tâche en cache

Ajoutez une politique de cache si une tâche peut réutiliser le même résultat JSON pour les mêmes entrées. Indiquez un stockage, une version et une clé qui identifie les entrées dont dépend le résultat.

<!-- tabs -->

```ts title="cache-store.ts"
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createTaskCacheStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
export const store = createTaskCacheStore({
  transporter: createLocalTransport({ directory }),
});
```

```ts title="summarize.ts"
import { defineTask } from "@elie-laloum/outpost";
import { store } from "./cache-store.ts";

export let executions = 0;
export const summarize = () =>
  defineTask({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });
export function executionCount() {
  return executions;
}
```

```ts title="run-cache.ts"
import { reportValue } from "./reporter.ts";
import { summarize } from "./summarize.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await defineWorkflow("release-notes", [summary]).start();
  result.unwrap();
  reportValue(result.value(summary), result.tasks[0]?.cacheHit ?? false);
  // Example output (second run): { summary: '3 fixes', execution: 1 } true
}
```

<!-- check:run -->

La seconde exécution restaure le premier résultat : `execution` reste à 1 et `cacheHit` vaut `true`.

## Choisir la clé

L’empreinte combine le nom du workflow, la clé de la tâche, `version` et la valeur JSON renvoyée par `key(ctx)`. Mettez-y tout ce qui peut changer la réponse.

Référence API : [TaskCacheOptions](../../reference/taskcacheoptions/) et [TaskCacheEntry](../../reference/taskcacheentry/).

<!-- tabs -->

```ts title="review-cache.ts"
import {
  createTaskCacheStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export const brief =
  "Review the parser for unsafe input handling. Do not edit files.";
export const store = createTaskCacheStore({
  transporter: createLocalTransport({
    directory: `${repository}/.outpost/storage`,
  }),
});
```

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { brief } from "./review-cache.ts";

export const reviewer = defineIsolatedTask({
  key: "reviewer",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: brief },
  }),
});
```

```ts title="review.ts"
import { defineTask, repositoryFingerprint } from "@elie-laloum/outpost";
import { store, brief } from "./review-cache.ts";
import { repository } from "./outpost.config.ts";
import { reviewer } from "./review-task.ts";

export const review = defineTask({
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

## Comprendre un résultat trouvé en cache

| Lors d’un hit                                                      | Résultat                                      |
| ------------------------------------------------------------------ | --------------------------------------------- |
| Valeur de la tâche                                                 | Restaurée et transmise aux tâches dépendantes |
| `TaskRecord.cacheHit`                                              | `true`                                        |
| Tentatives, usage, budget de tentatives                            | Rien d’enregistré ni de consommé              |
| Fichiers, commits, branches, état de la sandbox, artefacts, appels | Non rejoués                                   |

Mettez en cache les tâches dont la valeur est le produit : relectures, classifications, résumés, analyses.

## Choisir une tâche qui accepte un cache

Le résultat doit être du JSON sans perte ou `undefined` ; sinon, la tâche échoue après son exécution, sans nouvelle tentative.

Référence API : [TaskCacheOptions](../../reference/taskcacheoptions/), [TaskOptions](../../reference/taskoptions/) et [QueuedTaskOptions](../../reference/queuedtaskoptions/).

## Faire expirer ou renouveler les entrées

Référence API : [TaskCacheOptions](../../reference/taskcacheoptions/).

## Suivre les événements du cache

Affichez les événements du cache depuis l’observateur du workflow pour suivre les résultats trouvés, les absences et les erreurs de stockage. Un échec du cache n’empêche pas la tâche de s’exécuter ou de terminer.

```ts
import { reportValue } from "./reporter.ts";
import type { Workflow } from "@elie-laloum/outpost";

declare const workflow: Workflow;

await workflow.start({
  observe: (event) => {
    if (event.type === "cache")
      reportValue(event.key, event.cache, event.error);
    // Example output: summary hit undefined
  },
});
```

Référence API : [TaskCacheOutcome](../../reference/taskcacheoutcome/).

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
- Ne mettez pas en cache une `defineArtifactTask` lue par une tâche suivante : un hit dans une nouvelle exécution restaure une référence à l’exécution précédente, et `readArtifact()` échoue avec « Artifact dependency producer mismatch ».

API : [TaskCacheOptions](../../reference/taskcacheoptions/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/) · [WorkflowEvent](../../reference/workflowevent/).

## Workspaces de fichiers

Un hit de cache JSON ne restaure et ne rejoue jamais des effets de fichiers. Identité de workspace, empreintes des entrées et générations settled sont distinctes des valeurs en cache. Les caches de dépendances utilisent namespace et source logique, sans UUID de run. Voir [les workspaces de fichiers](../workspaces/).
