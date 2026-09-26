---
title: "Sélection de candidats"
description: "Valider des résultats concurrents avant de choisir un gagnant."
---

:::note[Expérimental]
`speculate()` est un helper explicite pour des exécutions concurrentes bornées.
:::

Fournissez dépôt, fournisseur de sandbox, jusqu’à huit candidats, budget partagé et callback `validate`. Chaque candidat tourne sur une branche distincte. `concurrency` vaut deux par défaut.

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates: ["minimal", "refactor"].map((key) => ({
    key,
    agent: coder,
    request: {
      brief: {
        text: `Fix the parser using a ${key} approach. Test and commit.`,
      },
    },
  })),
  async validate({ sandbox }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch);
```

## Valider le comportement réel

Le callback reçoit la sandbox active et la sortie du candidat. Exécutez-y les contrôles requis et renvoyez true uniquement si le candidat est acceptable. Une affirmation de réussite de l’agent ne suffit pas à le sélectionner.

## Budget et nettoyage

Le budget partagé contrôle tentatives et tokens observés. Les candidats déjà actifs peuvent consommer davantage avant l’arrivée de leurs résultats. Les perdants sont annulés et les ressources fermées selon leur propriété ; le travail récupérable reste soumis aux règles de conservation.

Examinez le résultat sélectionné et l’état hôte avant intégration. La mise en concurrence n’autorise pas la publication et ne résout pas tous les conflits hôte possibles. Consultez le contrat exact `SpeculationResult` et la [roadmap](../../project/roadmap/) avant de dépendre de ce chemin de recherche.

API : [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/).
