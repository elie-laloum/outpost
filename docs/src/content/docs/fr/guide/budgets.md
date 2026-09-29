---
title: "Budgets"
description: "Borner les tentatives partagées et les tokens observés."
---

Un budget de workflow s’applique à l’ensemble des tâches, reprises et restaurations de checkpoint. Définissez une limite de tentatives, de tokens, ou les deux.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const meter = defineTask({
  key: "meter",
  perform(context) {
    context.reportUsage({ input: 10, cached: 0, output: 5 });
    return "recorded";
  },
});
const result = await defineWorkflow("bounded", [meter]).start({
  budget: { attempts: 5, usage: { input: 50_000, output: 10_000 } },
});
console.log(result.usage);
```

<!-- check:run -->

Les helpers de tâches d’agent rapportent leur consommation au workflow. Les tâches personnalisées doivent rapporter celle qu’elles engagent ; les appels externes non rapportés ne peuvent pas être comptés. Les reçus permettent d’éviter le double comptage d’un même résultat persistant.

## Garantie d’un budget

Les contrôles gouvernent l’admission selon la consommation observée. Des requêtes concurrentes ou déjà actives peuvent consommer des tokens avant la réception de leur bilan. Ces limites ne sont pas un plafond monétaire exact et ne remplacent pas celles du compte.

`result.usage` contient les tentatives et tokens cumulés. Les checkpoints conservent ce total lors de la reprise explicitement autorisée du travail incomplet. Un harness personnalisé propose aussi des limites par boucle ; voir [Boucle de modèle](../harness/).

## Comptabilité incomplète

`Usage.complete === false` indique une borne inférieure, pas une exécution gratuite. Ce marqueur survit aux agrégations, tentatives échouées et checkpoints. L’absence de `complete` préserve le contrat existant des adaptateurs et tâches personnalisées ; elle ne prouve pas indépendamment que tous les appels externes ont été mesurés.

Lorsqu’un workflow ou une spéculation impose des limites de tokens sans `budget.attempts`, un usage incomplet arrête l’exécution avec `WorkflowUsageUnavailable`. Un adaptateur CLI déclarant l’usage indisponible déclenche ce contrôle avant le lancement de sa commande. Des compteurs de session manquants détectés en fin de commande arrêtent la suite ; ils ne peuvent annuler les tokens déjà consommés. Un budget de tentatives permet le repli borné, en conservant l’avertissement et le marqueur d’incomplétude.

Combinez les limites : `budget: { attempts: 3, usage: { input: 50_000 } }` sur le workflow, `timeoutMs: 120_000` sur chaque tâche d’agent et `deadlineMs: 60_000` sur sa requête de dispatch. Pour `speculate()`, définissez le budget de tentatives partagé et un délai sur chaque requête candidate. Une tentative désigne une exécution de tâche ou un candidat spéculatif, pas un appel modèle interne à la CLI. Aucun délai global de workflow n’est ajouté.

Pour les adaptateurs utilisant les compteurs de session lors d’une reprise, une mesure avant la commande exclut les tokens historiques. Une mesure initiale illisible ou un fork non mesurable marque l’usage incomplet au lieu de facturer le total hérité.

Copilot et Kimi collectent les compteurs de session après la fin de la commande. Leur avertissement au démarrage explique ce décalage. Un échec de lecture ne remplace jamais l’erreur du processus ; une mesure absente ou interrompue est signalée séparément. Voir [Copilot](../copilot-cli/) et [Kimi](../kimi-code/) pour les sources prises en charge.

API : [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/).
