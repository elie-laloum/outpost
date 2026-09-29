---
title: "Concurrence, relances et délais"
description: "Exécuter les tâches indépendantes en parallèle, relancer celles qui échouent, borner leur durée et choisir ce qu’un échec arrête."
---

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const flaky = defineTask({
  key: "flaky",
  retry: { attempts: 3, delayMs: 100 },
  perform: ({ attempt }) => {
    if (attempt < 2) throw new Error("Temporary failure");
    return { attempt };
  },
});
const lint = defineTask({ key: "lint", perform: () => "clean" });

const result = await defineWorkflow("checks", [flaky, lint]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(flaky)); // { attempt: 2 }
```

<!-- check:run -->

`flaky` et `lint` démarrent ensemble. `flaky` échoue une fois, attend 100 ms et réussit à sa deuxième tentative ; son enregistrement dans `result.tasks` indique `attempts: 2`.

## Exécuter des tâches en parallèle

`start({ concurrency })` fixe le nombre de tâches exécutées en même temps. La valeur par défaut est `1` : les tâches s’enchaînent une par une. Une tâche attend toujours chaque tâche de sa liste `after`.

:::caution
Des tâches qui partagent une sandbox ne doivent pas s’exécuter en même temps. Ordonnez-les avec `after`, ou donnez à chacune sa propre sandbox avec `defineIsolatedTask()`.
:::

## Relancer une tâche en échec

Une tâche s’exécute une seule fois, sauf si vous lui donnez une politique `retry`.

| Option       | Défaut                                          | Effet                                                          |
| ------------ | ----------------------------------------------- | -------------------------------------------------------------- |
| `attempts`   | Obligatoire                                     | Nombre total de tentatives, la première comprise.              |
| `delayMs`    | `0`                                             | Attente avant chaque relance.                                  |
| `backoff`    | `"fixed"`                                       | `"exponential"` double l’attente après chaque échec.           |
| `maxDelayMs` | 30 000 en mode exponentiel, sinon aucun plafond | Borne supérieure de l’attente calculée.                        |
| `jitter`     | `"none"`                                        | `"full"` tire une attente au hasard entre zéro et le plafond.  |
| `accepts`    | Toute erreur est relancée                       | `(error, attempt) => boolean` ; `false` fait échouer la tâche. |

```ts
import { OutpostError, defineTask, defineWorkflow } from "@elie-laloum/outpost";

const request = defineTask({
  key: "request",
  retry: {
    attempts: 4,
    delayMs: 500,
    backoff: "exponential",
    maxDelayMs: 10_000,
    jitter: "full",
    accepts: (error) =>
      error instanceof OutpostError &&
      [429, 503].includes(Number(error.details.status)),
  },
  perform: ({ signal }) => {
    signal.throwIfAborted();
    return "Replace with your cancellable request";
  },
});
const result = await defineWorkflow("requests", [request]).start();
result.unwrap();
console.log(result.tasks[0]?.attempts); // 1
```

<!-- check:run -->

Chaque relance émet un événement `retry` avec son `delayMs` (voir [Suivre la progression](../progress/)). Les relances comptent dans `budget.attempts` si vous fixez un [budget](../budgets/).

### Respecter `Retry-After`

Les [fournisseurs de modèles](../model-providers/) recopient un en-tête `Retry-After` valide dans `OutpostError.details.retryAfterMs`. La relance attend alors au moins cette durée, même au-delà de `maxDelayMs` et quel que soit le jitter. Votre propre code obtient le même comportement en levant une `OutpostError` avec `details.retryAfterMs` en millisecondes.

## Fixer des délais

| Réglage                | Couvre                                                                                                           | À l’expiration                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `timeoutMs` de tâche   | Une tentative.                                                                                                   | Le `signal` de la tentative est interrompu avec l’erreur `<key> timed out` ; la tâche est relancée s’il reste des tentatives.                    |
| `start({ timeoutMs })` | Tout l’appel à `start()` : acquisition du checkpoint, conditions, chaque tentative et chaque attente de relance. | Les tâches en cours sont annulées, aucune ne démarre plus, `status` vaut `"failed"` et `errors` contient une `OutpostError` de code `"timeout"`. |

```ts
import { setTimeout as sleep } from "node:timers/promises";
import { OutpostError, defineTask, defineWorkflow } from "@elie-laloum/outpost";

const slow = defineTask({
  key: "slow",
  timeoutMs: 200,
  retry: { attempts: 2 },
  perform: ({ signal }) => sleep(5_000, "late", { signal }),
});
const result = await defineWorkflow("deadline", [slow]).start({
  timeoutMs: 300,
});
console.log(
  result.status,
  result.errors.map((error) =>
    error instanceof OutpostError ? error.code : error,
  ),
); // failed [ 'timeout' ]
```

<!-- check:run -->

La première tentative expire après 200 ms, la seconde est annulée par l’échéance du workflow à 300 ms. Les deux valeurs sont des entiers positifs d’au plus 2 147 483 647 ms. Chaque `start()` de reprise reçoit une nouvelle échéance ; le temps écoulé entre deux appels ne compte pas.

## Choisir ce qu’un échec arrête

Une tâche échoue quand sa dernière tentative échoue. La suite dépend de `stopOnError`.

| Autres tâches        | `stopOnError: true` (défaut)                                | `stopOnError: false`                                                               |
| -------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| En cours             | Leur `signal` est interrompu ; elles finissent `cancelled`. | Continuent.                                                                        |
| Pas démarrées        | Finissent `cancelled`.                                      | Les dépendantes de la tâche en échec finissent `skipped` ; les autres s’exécutent. |
| `status` du workflow | `"failed"`                                                  | `"failed"`                                                                         |

`unwrap()` lève une `WorkflowFailure` sauf si `status` vaut `"done"`. Lisez `result.tasks` pour le `status`, les `attempts` et l’`error` de chaque tâche, et `result.errors` pour les échecs eux-mêmes.

## Sauter une tâche avec une condition

`condition` s’exécute une fois, avant la première tentative. Si elle renvoie `false`, la tâche finit `skipped`, tout comme les tâches qui en dépendent.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const changes = defineTask({ key: "changes", perform: () => ["README.md"] });
const tests = defineTask({
  key: "tests",
  after: [changes],
  condition: (context) =>
    context.value(changes).some((file) => file.endsWith(".ts")),
  perform: () => "Tests passed",
});
const result = await defineWorkflow("docs-only", [changes, tests]).start();
result.unwrap();
console.log(result.tasks.map((task) => `${task.key}: ${task.status}`));
// [ 'changes: done', 'tests: skipped' ]
```

<!-- check:run -->

Une tâche sautée n’a pas de valeur : `result.value(tests)` lève une exception.

## Annuler une exécution

Passez un `AbortSignal` dans `start({ signal })`. Il interrompt le `context.signal` de chaque tâche en cours, et le workflow se termine avec `status: "cancelled"`.

Les tâches d’agent, de commande et isolées transmettent `context.signal` pour vous. Dans `defineTask()`, passez-le à chaque commande, requête et attente que lance votre code.

## Limites

- L’annulation est coopérative : un code qui ignore `context.signal` continue jusqu’à son retour, même au-delà de l’échéance du workflow ; sa valeur est alors ignorée.
- Une relance réexécute toute la tâche et peut répéter ses effets de bord. Dédupliquez-les avec `context.idempotencyKey`, identique d’une relance à l’autre : voir [Files de jobs et workers](../job-queues/).
- Chaque appel à `start()`, comme une reprise depuis un checkpoint ou après une pause sur quota, accorde de nouveau `retry.attempts` et fait repartir le backoff de `delayMs` ; les numéros de tentative restent cumulés dans un checkpoint.
- Avec les [pauses sur quota](../quota-pauses/), une erreur de quota met la tâche en pause au lieu de la relancer.
- Les réglages de relance, les délais de tâche et la présence d’une condition font partie de l’identité du checkpoint : les modifier fait rejeter un checkpoint existant (voir [Exécutions durables](../durable-runs/)).

API : [defineTask](../../reference/definetask/) · [Retry](../../reference/retry/) · [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowResult](../../reference/workflowresult/) · [OutpostError](../../reference/outposterror/)
