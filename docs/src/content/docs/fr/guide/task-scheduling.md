---
title: "Ordonnancement et reprises"
description: "Contrôler concurrence, propagation des échecs et tentatives."
---

Définissez `concurrency` sur `start()` et la politique de reprise sur chaque tâche. Les reprises sont explicites car une nouvelle tentative peut répéter des effets.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const check = task({
  key: "check",
  retry: { attempts: 2, delayMs: 100 },
  timeoutMs: 5_000,
  perform: ({ signal, attempt }) => {
    signal.throwIfAborted();
    return { attempt, ok: true };
  },
});
const result = await workflow("checks", [check]).start({ concurrency: 2 });
result.unwrap();
console.log(result.status);
```

<!-- check:run -->

## Propagation des échecs

`stopOnError` arrête l’admission de nouveaux travaux après un échec lorsqu’il est activé. Une dépendance échouée empêche la réussite des tâches en aval. Inspectez les statuts et tentatives de chaque tâche, pas seulement le statut global.

`condition` s’évalue avant la première tentative. Utilisez-la pour sauter un travail optionnel selon les dépendances déclarées. Une tâche sautée ne fournit pas de sortie réussie à consommer comme si elle avait tourné.

## Annulation coopérative

Transmettez `context.signal` aux commandes, requêtes réseau et requêtes d’agent. `timeoutMs` signale l’annulation d’une tentative ; il ne peut pas terminer de force du code applicatif arbitraire. `retry.accepts(error, attempt)` limite les erreurs autorisant une reprise.

N’exécutez pas d’opérations concurrentes dans une même sandbox empruntée. Ajoutez des dépendances ou allouez des environnements distincts avec `isolatedTask`.

API : [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [Retry](../../reference/retry/).
