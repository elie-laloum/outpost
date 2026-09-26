---
title: "Plusieurs dépôts"
description: "Donner une sandbox à chaque dépôt et relier les résultats."
---

Utilisez un `isolatedTask` par dépôt. Chaque tâche possède le cycle de vie de sa requête, tandis que le workflow contrôle les dépendances et la concurrence.

```ts
import { isolatedTask, workflow } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const review = (key: string, repository: string) =>
  isolatedTask({
    key,
    request: ({ signal }) => ({
      repository,
      sandboxProvider,
      agent: coder,
      signal,
      branch: { mode: "named", name: `review/${key}` },
      brief: { text: "Review the public API without editing files." },
    }),
  });
const api = review("api", "/projects/api");
const web = review("web", "/projects/web");
const result = await workflow("repositories", [api, web]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(api).text, result.value(web).text);
```

Remplacez les deux chemins absolus par des checkouts existants. Des branches nommées distinctes séparent les travaux de revue.

## Ordonner le travail lié

Ajoutez `after: [api]` à la tâche web si elle a besoin du résultat API, puis lisez-le via `context.value(api)` dans `request`. Cette dépendance ordonne les opérations ; elle ne fusionne pas leurs historiques Git et ne leur donne pas un checkout commun.

## Échec partiel

Un dépôt peut réussir tandis qu’un autre échoue. Examinez le résultat de chaque tâche et le workspace conservé avant de relancer. Il n’existe ni rollback entre dépôts ni push automatique. Placez la publication finale derrière une étape contrôlée par l’application.

API : [isolatedTask](../../reference/isolatedtask/).
