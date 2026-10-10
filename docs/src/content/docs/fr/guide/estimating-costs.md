---
title: "Estimer et limiter les dépenses"
description: "Estimez une dépense en tokens sans appeler de modèle."
---

Estimez une dépense en tokens sans appeler de modèle. Enregistrez ces fichiers ensemble et lancez `node monetary-budget.ts`. Les tarifs ci-dessous sont illustratifs, pas ceux d’un fournisseur actuel.

## Fixer les tarifs et la limite

Les tarifs sont exprimés par million de tokens dans une seule devise. Les noms de modèles doivent correspondre exactement à la configuration de vos agents.

```ts title="prices.ts"
import type { ModelPriceTable } from "@elie-laloum/outpost";
export const prices: ModelPriceTable = {
  currency: "EUR",
  models: {
    "my-model": { input: 2, cached: 0.5, cacheCreated: 3, output: 8 },
  },
};
```

Cette tâche déclare sa consommation explicitement. Les fonctions de tâches d’agent le font déjà ; un dispatch personnalisé doit recevoir `prices: context.prices`, et un worker doit retourner la consommation par modèle.

```ts title="monetary-budget.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { prices } from "./prices.ts";
const task = defineTask({
  key: "meter",
  perform(context) {
    const tokens = { input: 100_000, cached: 0, output: 50_000 };
    context.reportUsage({ ...tokens, models: { "my-model": tokens } });
    return "recorded";
  },
});
export const result = await defineWorkflow("cost", [task]).start({
  budget: { prices, cost: { currency: "EUR", limit: 20 } },
});
console.log(result.usage.cost);
```

<!-- check:run -->

Le résultat estime **0,60 €** : 0,20 € en entrée et 0,40 € en sortie. La limite de 20 € couvre toutes les tâches et tentatives. Pour estimer sans arrêter l’exécution, fournissez `prices` sans `cost`.

## Traiter une estimation incomplète

Un budget monétaire strict s’arrête avec `WorkflowCostUnavailable` si la consommation, un modèle ou un tarif manque, même avec une limite de tentatives. Atteindre le plafond annule les tentatives actives avec `WorkflowBudgetExceeded`.

:::caution
Les requêtes en cours peuvent dépasser le plafond. Gardez les limites de dépenses du fournisseur : ce calcul estime un prix par token, y compris pour les comptes par abonnement, pas une facture.
:::

## Charger un catalogue public de tarifs

Pour utiliser les tarifs de Models.dev, associez votre alias de modèle à son identifiant dans le catalogue. Le taux EUR est illustratif.

```ts title="catalog-prices.ts"
import { loadModelPrices } from "@elie-laloum/outpost";

export const prices = await loadModelPrices({
  provider: "openai",
  models: { "my-model": "gpt-5" },
  currency: "EUR",
  usdExchangeRate: 0.9,
});
```

Dans `monetary-budget.ts`, importez `prices` depuis `./catalog-prices.ts`. Vérifiez les tarifs chargés ; ils ne sont pas actualisés automatiquement. [loadModelPrices](../../reference/loadmodelprices/) détaille OpenRouter, la conversion et les erreurs.

## Garder une estimation stable à la reprise

Sauvegardez et réutilisez la grille : la reprise recalcule le coût total depuis les compteurs enregistrés par modèle. Les anciens checkpoints sans ces compteurs ne permettent pas un budget monétaire strict. Une compétition durable exige sa grille d’origine.

API : [ModelPriceTable](../../reference/modelpricetable/) · [UsageCost](../../reference/usagecost/) · [WorkflowBudget](../../reference/workflowbudget/).
