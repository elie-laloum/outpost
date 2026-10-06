---
title: "Limiter les tentatives et les tokens"
description: "Définissez le budget d’un workflow et suivez la consommation au fil des tentatives et des reprises."
---

## Définir un budget de workflow

Passez un `budget` à la méthode `start()` du workflow pour limiter les tentatives, les tokens déclarés ou les deux. Ces limites portent sur l’ensemble des tâches du workflow, et non sur chaque tâche séparément.

```ts
import { reportValue } from "./reporter.ts";
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
reportValue(result.usage);
// Example output: { attempts: 1, tokens: { input: 10, cached: 0, output: 5 } }
```

<!-- check:run -->

Le script affiche `{ attempts: 1, tokens: { input: 10, cached: 0, output: 5 } }`.

Référence API : [WorkflowBudget](../../reference/workflowbudget/).

`speculate()` exige le même `budget`, partagé par ses candidats : voir [Candidats concurrents](../speculation/).

## Comprendre le décompte des tentatives

Chaque tentative est admise sur `budget.attempts` avant de démarrer.

<!-- features -->

- [Tentative de tâche](../concurrency-and-retries/): Chaque exécution d’une tâche, relances comprises.
- [Tour de boucle](../verification-loops/): Chaque tour d’une tâche en boucle.
- [Candidat spéculatif](../speculation/): Chaque candidat lancé par `speculate()`.

Un échange avec l’agent compte comme une tentative, même s’il comporte de nombreuses requêtes au modèle. Une tâche ignorée ou un résultat restauré depuis le [cache](../task-cache/) ne consomme aucune tentative.

## Déclarer la consommation

Les fonctions utilitaires de tâche d’agent rapportent automatiquement les tokens de leur agent : `defineAgentTask()`, `defineIsolatedTask()`, `defineInteractiveAgentTask()` et `defineQueuedTask()`. Une tâche personnalisée qui appelle un modèle rapporte ce qu’elle a consommé.

```ts
import { defineTask } from "@elie-laloum/outpost";
import type { Usage } from "@elie-laloum/outpost";

declare function summarize(
  text: string,
): Promise<{ id: string; text: string; usage: Usage }>;

const summary = defineTask({
  key: "summary",
  async perform(context) {
    const reply = await summarize("Summarize the release notes.");
    context.reportUsageOnce?.(`summary:${reply.id}`, reply.usage);
    return reply.text;
  },
});
```

`reportUsage(usage)` s’ajoute aux totaux. `reportUsageOnce(receipt, usage)` ignore un reçu déjà enregistré par la tâche, même après une reprise de checkpoint : un résultat lu deux fois compte une seule fois. Les deux ne fonctionnent que pendant la tentative en cours.

## Comprendre les limites du budget

Outpost vérifie la consommation déclarée avant d’autoriser la suite du travail. Le budget s’applique à ces totaux enregistrés ; il ne prédit pas les tokens qu’une requête en cours va consommer.

| Limite                                              | Quand elle est vérifiée                              | Ce qui se passe                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `attempts`                                          | Avant chaque tentative                               | Aucune nouvelle tentative ; celles en cours se terminent. `WorkflowBudgetExceeded` sur `"attempts"`. |
| `usage.input`, `usage.output`, …                    | Avant chaque tentative et à chaque rapport de tokens | Les tentatives en cours sont annulées ; rien d’autre ne démarre. `WorkflowBudgetExceeded`.           |
| Limites de tokens, sans `attempts`, usage incomplet | Avant chaque tentative et à chaque rapport de tokens | Les tentatives en cours sont annulées ; rien d’autre ne démarre. `WorkflowUsageUnavailable`.         |

Une limite arrête l’exécution dès que le total l’atteint. L’exécution se termine alors avec `status: "failed"`, les tâches arrêtées sont `cancelled` et `result.errors` contient l’erreur avec ses valeurs `dimension`, `limit` et `observed`.

:::caution
Un tour d’agent en cours peut consommer des tokens avant de les rapporter : le total peut donc dépasser une limite. Un budget n’est pas un plafond de facturation : gardez des limites de dépense chez votre fournisseur.
:::

## Gérer une consommation incomplète

`result.usage.tokens.complete === false` signifie qu’une partie des tokens n’a pas pu être mesurée : les compteurs sont une borne inférieure. Ce marqueur persiste à travers les relances, les agrégations et les checkpoints.

Avec des limites de tokens sans `attempts`, une consommation incomplète arrête l’exécution avec `WorkflowUsageUnavailable`. Avec `attempts`, l’exécution continue sous la limite de tentatives et Outpost émet un avertissement.

[GitHub Copilot CLI](../copilot-cli/) et [Kimi Code](../kimi-code/) lisent leurs compteurs définitifs dans la session, après la fin de la CLI. Pour eux surtout, limitez chaque exécution en tentatives et en temps.

<!-- tabs -->

```ts title="fix-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const fix = defineIsolatedTask({
  key: "fix",
  timeoutMs: 30 * 60_000,
  retry: { attempts: 2 },
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests and commit the fix." },
    deadlineMs: 20 * 60_000,
  }),
});
```

```ts title="run-fix.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";

export const result = await defineWorkflow("fix-tests", [fix]).start({
  budget: { attempts: 3, usage: { input: 2_000_000 } },
});
reportValue(result.status, result.usage);
// Example output: done { attempts: 1, tokens: { input: 1200, cached: 0, output: 320 } }
```

`timeoutMs` borne chaque tentative de tâche et `deadlineMs` chaque tour d’agent : voir [Limites et annulation](../limits-and-cancellation/). [Choisir un agent](../choose-an-agent/) indique quand chaque agent rapporte sa consommation.

## Conserver les totaux entre les reprises

Un [checkpoint](../durable-runs/) enregistre `result.usage`. Une exécution reprise part des totaux enregistrés : le budget couvre toute l’exécution, pas seulement le processus en cours.

Pour poursuivre une exécution arrêtée par son budget, relancez-la avec un budget plus élevé et autorisez la reprise de ses tâches annulées : voir [Exécutions durables](../durable-runs/). Une course spéculative persistante doit reprendre avec le budget de son démarrage.

## Fixer d’autres limites

<!-- features -->

- [Limites et annulation](../limits-and-cancellation/): Limitez un tour d’agent en durée ou en silence.
- [Concurrence, relances et délais](../concurrency-and-retries/): Limitez en durée chaque tentative de tâche et une exécution entière.
- [Harness intégré](../harness/): Limitez les requêtes au modèle, les appels d’outils et les tokens d’un tour.

API : [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/) · [Usage](../../reference/usage/) · [TaskContext](../../reference/taskcontext/) · [WorkflowBudgetExceeded](../../reference/workflowbudgetexceeded/) · [WorkflowUsageUnavailable](../../reference/workflowusageunavailable/).

## Inclure l’usage des décisions

Les [tâches de décision](../decisions/) ajoutent leur usage normalisé aux budgets du workflow. Le [routage de modèles](../model-routing/) compte aussi dans les budgets du harness, de ses ancêtres et du workflow, une fois par requête du routeur. L’usage valide reste compté lorsque la troncature fait rejeter le résultat. Un reçu absent représente un usage incomplet et les budgets stricts refusent une continuation dont la consommation est inconnue.
