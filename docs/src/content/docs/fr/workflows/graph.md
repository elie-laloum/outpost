---
title: "Construire un workflow typé"
description: "Construire un workflow typé — Outpost"
sidebar:
  order: 1
---

Définissez les tâches, déclarez leurs dépendances, puis lancez le graphe. Les définitions sont réutilisables ; les résultats appartiennent à une exécution.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: async () => ({ ready: true }),
});
const change = task({
  key: "change",
  after: [inspect],
  condition: (context) => context.value(inspect).ready,
  perform: async (context) => ({ checked: context.value(inspect).ready }),
});
const delivery = workflow("delivery", [inspect, change]);
const result = await delivery.start({ concurrency: 2 });
result.unwrap();
console.log(result.value(change).checked);
console.log(delivery.diagram());
```

## Règles de dépendance

Les clés sont uniques. Chaque dépendance doit appartenir au graphe ; les cycles sont refusés avant l’exécution. `context.value(task)` utilise l’objet tâche, pas seulement son nom, et n’accède qu’aux dépendances déclarées. Leur résultat typé est disponible après une fin réussie.

`condition(context)` s’exécute avant la première tentative. Une condition fausse ignore la tâche ainsi que ses descendants. Une dépendance échouée ou annulée empêche également les tâches dépendantes de démarrer.

`TaskContext` expose `signal`, `attempt` à partir de 1, `executionId` et `value` typé. Transmettez `signal` à vos opérations asynchrones pour permettre une annulation propre.

## Résultat et visualisation

`result.status` vaut `done`, `failed` ou `cancelled`. `tasks` contient statut, tentatives, dates et texte d’erreur éventuel. `errors` conserve les erreurs originales ; `observerErrors` conserve celles des callbacks. `result.unwrap()` lève `WorkflowFailure` si l’exécution n’a pas réussi ; l’erreur conserve le résultat.

`delivery.diagram()` retourne du texte Mermaid représentant les dépendances. Il n’exécute aucune tâche. Enregistrez-le ou affichez-le avec un outil compatible pour examiner le graphe.

Poursuivez avec [les politiques d’exécution](../execution/) ou [les tâches de sandbox](../sandbox-tasks/).

Consultez les [budgets de consommation](../budgets/) pour les limites partagées d’admission et de tokens, et la [télémétrie](../../operations/telemetry/) pour les métriques structurées.
