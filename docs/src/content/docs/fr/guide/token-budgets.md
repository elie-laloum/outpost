---
title: "Budgets de consommation"
description: "Borner les tentatives partagées et les tokens observés."
---

Un budget de workflow s’applique à l’ensemble des tâches, reprises et restaurations de checkpoint. Définissez une limite de tentatives, de tokens, ou les deux.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const meter = task({
  key: "meter",
  perform(context) {
    context.reportUsage({ input: 10, cached: 0, output: 5 });
    return "recorded";
  },
});
const result = await workflow("bounded", [meter]).start({
  budget: { attempts: 5, usage: { input: 50_000, output: 10_000 } },
});
console.log(result.usage);
```

<!-- check:run -->

Les helpers de tâches d’agent rapportent leur consommation au workflow. Les tâches personnalisées doivent rapporter celle qu’elles engagent ; les appels externes non rapportés ne peuvent pas être comptés. Les reçus permettent d’éviter le double comptage d’un même résultat persistant.

## Garantie d’un budget

Les contrôles gouvernent l’admission selon la consommation observée. Des requêtes concurrentes ou déjà actives peuvent consommer des tokens avant la réception de leur bilan. Ces limites ne sont pas un plafond monétaire exact et ne remplacent pas celles du compte.

`result.usage` contient les tentatives et tokens cumulés. Les checkpoints conservent ce total lors de la reprise explicitement autorisée du travail incomplet. Un harness personnalisé propose aussi des limites par boucle ; voir [Boucle de modèle](../model-loop/).

API : [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/).
