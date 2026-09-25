---
title: "Investigations indépendantes en parallèle"
description: "Investigations indépendantes en parallèle — Outpost"
sidebar:
  order: 4
---

Utilisez cette recette pour des tâches indépendantes des modifications des autres. Chacune reçoit sa branche, son worktree et sa sandbox. Préparez l’[installation commune](../../../cookbook/) ; vérifiez que machine et compte supportent deux agents simultanés.

```ts
import { isolatedTask, workflow, claude } from "@elie-laloum/outpost";

const run = Date.now().toString(36);
const topics = ["dependency risks", "missing parser tests"];
const investigations = topics.map((topic, index) =>
  isolatedTask({
    key: "audit-" + index,
    request: () => ({
      agent: claude(),
      branch: { mode: "named", name: "audit/" + run + "-" + index },
      brief: {
        text:
          "Investigate " +
          topic +
          ". Do not edit. Return a report with evidence.",
      },
      deadlineMs: 180_000,
    }),
  }),
);
const result = await workflow("independent-audits", investigations).start({
  concurrency: 2,
  stopOnError: false,
});
for (const item of investigations) {
  const record = result.tasks.find((record) => record.key === item.key);
  if (record?.status === "done") console.log(item.key, result.value(item).text);
}
result.unwrap();
```

## Isolation

Des jobs concurrents ne doivent pas modifier le même checkout. Les noms uniques évitent les conflits de propriété. Cette recette n’intègre pas les branches. Réduisez la concurrence si les quotas ou ressources sont insuffisants.

## Échecs partiels

Avec **stopOnError: false**, une tâche indépendante peut terminer après l’échec d’une autre. Lisez uniquement les valeurs réussies, puis appelez **unwrap()** pour signaler l’échec global. Évitez les reprises automatiques d’agents sans maîtriser leurs effets répétés.
