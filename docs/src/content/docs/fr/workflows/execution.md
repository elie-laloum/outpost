---
title: "Concurrence, tentatives et échecs"
description: "Concurrence, tentatives et échecs — Outpost"
sidebar:
  order: 2
---

`workflow.start()` accepte `concurrency`, `stopOnError`, `signal` et `observe`. La concurrence vaut `1` par défaut. Les tâches prêtes et indépendantes démarrent dans cette limite. Les ressources partagées nécessitent toujours une sérialisation par dépendances.

```ts
import { task, workflow } from "@elie-laloum/outpost";
import { setTimeout } from "node:timers/promises";

const work = task({
  key: "work",
  timeoutMs: 5_000,
  retry: {
    attempts: 3,
    delayMs: 100,
    accepts: (error) => error instanceof Error,
  },
  async perform(context) {
    await setTimeout(20, undefined, { signal: context.signal });
    return context.attempt;
  },
});
const result = await workflow("retry-example", [work]).start({
  concurrency: 1,
  stopOnError: false,
  observe: (event) => console.log(event.type, event.key, event.status),
});
result.unwrap();
```

`retry.attempts` est le nombre total de tentatives, première comprise. `delayMs` sépare les nouvelles tentatives autorisées. `accepts(error, attempt)` filtre les échecs. L’annulation interrompt les délais. Rendez les opérations répétées idempotentes ou conservez l’état nécessaire pour éviter de répéter un effet externe.

`stopOnError` vaut `true` par défaut : un échec annule les tâches sœurs actives. Avec `false`, les branches indépendantes peuvent finir ; les descendants d’une tâche échouée restent ignorés. Une annulation externe produit un workflow annulé.

`timeoutMs` est coopératif. Il annule le signal de la tâche, mais JavaScript ne peut pas arrêter de force un callback arbitraire. Le planificateur attend le nettoyage des tâches actives avant de retourner.

Les événements sont `start`, `task`, `attempt`, `usage`, `retry` et `finish`, avec identifiant d’exécution, nom du workflow, date et éventuellement tâche/statut/tentative. Les erreurs du callback sont conservées dans `observerErrors` sans changer le résultat.
