---
title: "Faire une pause quand un quota est atteint"
description: "Enregistrez un workflow après une erreur de quota définitive et reprenez quand l’accès est disponible."
---

## Mettre en pause au lieu d’échouer

Définissez `onQuota` dans la méthode `start()` du workflow pour conserver la progression après une erreur de quota définitive. Avec un checkpoint configuré, la tâche concernée se met en pause afin de reprendre plus tard.

<!-- tabs -->

```ts title="quota-review.ts"
import { defineTask, OutpostError } from "@elie-laloum/outpost";

export let calls = 0;
export const review = defineTask({
  key: "review",
  perform: () => {
    if (++calls === 1)
      throw new OutpostError("quota", "You've hit your session limit", {
        resetAt: new Date(Date.now() + 1_000).toISOString(),
      });
    return "reviewed";
  },
});
export function reviewCount() {
  return calls;
}
```

```ts title="quota-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "nightly-2026-09-28",
  version: "1",
};
```

```ts title="resume.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./quota-review.ts";
import { checkpoint } from "./quota-checkpoint.ts";

export const result = await defineWorkflow("nightly", [review]).start({
  checkpoint,
  onQuota: { action: "pause", maxWaitMs: 6 * 60 * 60_000 },
});
result.unwrap();
reportValue(result.value(review));
// Example output: reviewed
```

<!-- check:run -->

Le script affiche `reviewed` : la limite simulée se réinitialise après une seconde, dans la fenêtre `maxWaitMs`, donc le workflow attend puis relance la tâche.

`onQuota` exige un [checkpoint](../durable-runs/) pour conserver la pause. Avec la valeur par défaut de `maxWaitMs`, `0`, rien n’attend dans le processus : chaque pause est durable.

## Reconnaître une erreur de quota

Les agents et les fournisseurs de modèles rejettent avec une `OutpostError` de code `quota` :

| Source                                         | Signal                                                                      | Réinitialisation     |
| ---------------------------------------------- | --------------------------------------------------------------------------- | -------------------- |
| [Claude Code](../claude-code/)                 | `rate_limit_event` refusé, `rate_limit` ou `billing_error`, texte de limite | Depuis `resetsAt`    |
| [Codex](../codex/)                             | `usageLimitExceeded` ou `rateLimitExceeded`, texte de limite d’usage        | Inconnue             |
| [Copilot CLI](../copilot-cli/)                 | `session.error` de type `quota` ou `rate_limit`, texte de limite            | Inconnue             |
| [Kimi Code](../kimi-code/)                     | Texte de quota, de solde ou de limite de débit                              | Inconnue             |
| [Antigravity](../antigravity/)                 | `RESOURCE_EXHAUSTED` ou texte de quota                                      | Inconnue             |
| [Fournisseurs de modèles](../model-providers/) | HTTP 429, erreur de flux de limite de débit ou `insufficient_quota`         | Depuis `Retry-After` |

Un signal d’agent CLI ne compte que si le processus de l’agent échoue. Les avis de nouvelle tentative ne sont pas des quotas. `quotaFault(error)` lit le message et le `resetAt` d’une erreur de quota interceptée, même imbriquée.

Un [agent de secours](../fallback-agents/) change d’agent au lieu d’attendre : la tâche ne se met en pause que lorsque tous les candidats ont atteint une limite.

## Ce qui se passe après une erreur de quota

<!-- canvas -->

- **Pause**: La tentative qui a atteint la limite s’arrête.
  - Étapes
  - **Garder les retries**: L’erreur ne consomme pas les tentatives de `retry`.
  - **Enregistrer la pause**: La tâche passe en `paused` avec un enregistrement `quota`, puis le checkpoint est sauvegardé.
  - → **Attente**: puis
- **Attente**: Seulement si l’heure de réinitialisation est connue.
  - Étapes
  - **Attendre dans le processus**: Une réinitialisation comprise dans `maxWaitMs` émet un événement `quota` de `status: "waiting"`, puis relance la tâche.
  - **Pause durable**: Sinon, la tâche reste en pause. Les tâches indépendantes continuent, les tâches dépendantes attendent et `start()` renvoie `paused`.
  - → **Reprise**: puis
- **Reprise**: Un `start()` ultérieur avec le même checkpoint.
  - Étapes
  - **Relancer**: Une réinitialisation inconnue ou passée relance la tâche aussitôt.
  - **Attendre d’abord**: Une réinitialisation comprise dans `maxWaitMs` est attendue, puis la tâche s’exécute.
  - **Rester en pause**: Une réinitialisation plus lointaine laisse la tâche en pause sans appeler l’agent.

L’enregistrement en pause dans `result.tasks` contient `quota.resetAt` : planifiez le `start()` suivant à partir de cette heure. `onQuota` autorise la relance, sans `resume: "retry-incomplete"`. Une [tâche en boucle](../verification-loops/) reprend la phase du tour qui a atteint la limite.

## Poursuivre la conversation interrompue

La première tentative après une pause reçoit `context.quota` : la conversation capturée et la branche de travail conservée.

| Tâche ou appel                                                                | Tentative suivante                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`defineAgentTask()`](../../reference/defineagenttask/)                       | Poursuit la conversation dans votre sandbox et votre workspace.                                                   |
| [`defineIsolatedTask()`](../../reference/defineisolatedtask/)                 | La poursuit dans une nouvelle sandbox, sur la même branche ; un workspace intégré part de la branche interrompue. |
| [`defineInteractiveAgentTask()`](../../reference/defineinteractiveagenttask/) | Poursuit la conversation du tour interrompu.                                                                      |
| [`defineQueuedTask()`](../../reference/definequeuedtask/)                     | Publie un nouveau job, `<key>:quota:<attempt>`, avec l’`idempotencyKey` d’origine.                                |
| [`speculate()`](../../reference/speculate/)                                   | Dans une course durable, relance les candidats arrêtés par une limite, dans de nouvelles conversations.           |

Un tour poursuivi envoie une courte consigne de reprise au lieu du brief. Passez `quotaResume: "restart"` à une tâche d’agent ou isolée pour renvoyer la requête d’origine.

Claude Code, Codex, Copilot CLI et Kimi Code peuvent poursuivre. Un [agent de secours](../fallback-agents/) repart de son premier candidat avec le brief d’origine.

## Transmettre la conversation à un traitement en file

Un worker enregistre l’erreur de quota d’un traitement dans `QueueResult.quota`, et `defineQueuedTask()` rejette avec le code `quota`. Transmettez la conversation par l’entrée de la tâche :

```ts
import { defineQueuedTask } from "@elie-laloum/outpost";
import type { TaskQueue } from "@elie-laloum/outpost";

function implement(queue: TaskQueue) {
  return defineQueuedTask({
    key: "implement",
    queue,
    handler: "implement",
    input: (context) => ({ continueFrom: context.quota?.conversation ?? null }),
    decode: String,
  });
}
```

Le traitement lance ensuite son dispatch avec `continuation: { id: input.continueFrom }`. [Files de jobs](../job-queues/) présente les workers et les clés d’idempotence.

## Suspendre une course après une erreur de quota

Quand des limites arrêtent des candidats et qu’aucun ne gagne, `speculate()` renvoie le statut `quota` avec la réinitialisation connue la plus proche. Levez-la depuis une tâche pour mettre le workflow en pause :

```ts
import { OutpostError, speculate, defineTask } from "@elie-laloum/outpost";
import type { SpeculationOptions } from "@elie-laloum/outpost";

function race(options: SpeculationOptions) {
  return defineTask({
    key: "race",
    async perform() {
      const result = await speculate(options);
      if (result.status === "quota" && result.quota)
        throw new OutpostError("quota", result.quota.message, {
          ...(result.quota.resetAt ? { resetAt: result.quota.resetAt } : {}),
        });
      return result.winner?.branch ?? null;
    },
  });
}
```

Une [course durable](../speculation/) relance ensuite seulement ces candidats, avec des budgets cumulés. Sans durabilité, tous les candidats sont relancés.

## Limites

- `start()` refuse `onQuota` sans checkpoint.
- Chaque relance compte dans `budget.attempts`. Le `timeoutMs` du workflow interrompt aussi les attentes, et une attente annulée laisse la tâche en pause.
- Les heures de réinitialisation écrites dans le texte de l’agent ne sont pas analysées ; elles restent dans le message.
- Les autres agents, la capture désactivée, une requête avec sa propre `continuation` ou plusieurs `passes` repartent du brief.
- Les changements non commités d’une tentative intégrée interrompue restent dans son [worktree conservé](../recovery/).
- Les workers ne transmettent que les conversations capturées par le dispatch du traitement.

API : [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [WorkflowQuotaPause](../../reference/workflowquotapause/) · [QuotaResumePolicy](../../reference/quotaresumepolicy/) · [quotaFault](../../reference/quotafault/) · [TaskContext](../../reference/taskcontext/) · [QueueResult](../../reference/queueresult/) · [WorkflowOptions](../../reference/workflowoptions/)
