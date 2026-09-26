---
title: "Étapes de validation"
description: "Suspendre un workflow pour une décision explicite et fiable."
---

Utilisez `approvalTask()` pour arrêter un workflow jusqu’à l’approbation ou au rejet d’un acteur autorisé. Les étapes de validation exigent un checkpoint pour conserver la demande au-delà du processus courant.

```ts
import {
  approvalTask,
  localTransport,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

const approve = approvalTask({
  key: "approve",
  prompt: "Approve the reviewed change?",
  actors: ["maintainer"],
});
const pipeline = workflow("delivery", [approve]);
const store = workflowCheckpointStore({
  transporter: localTransport({ directory: ".outpost/storage" }),
});
const result = await pipeline.start({
  checkpoint: { store, runId: "delivery-42", version: "1" },
});
console.log(result.status, result.tasks[0]?.pause);
```

<!-- check:run -->

## Soumettre une décision

Lisez l’enregistrement suspendu et redémarrez le même workflow avec `decisions`. Chaque décision fournit `executionId`, la `key` de tâche, le `requestId` en attente, `actor`, `reason` et `action: "approve"` ou `"reject"`. Elle doit correspondre à la demande réellement en attente ; ne la construisez pas depuis un état d’interface périmé.

```ts
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowResult,
} from "@elie-laloum/outpost";

async function approveReview(
  pipeline: Workflow,
  paused: WorkflowResult,
  checkpoint: WorkflowCheckpointOptions,
) {
  const pending = paused.tasks.find(
    (record) => record.key === "approve",
  )?.pause;
  if (!pending) throw new Error("No pending approval");
  return pipeline.start({
    checkpoint,
    decisions: [
      {
        executionId: paused.executionId,
        key: "approve",
        requestId: pending.id,
        actor: "maintainer",
        reason: "Reviewed the patch and test results",
        action: "approve",
      },
    ],
  });
}
```

Placez les tâches de livraison après cette étape. Un rejet empêche leur exécution normale. `pauseTask()` suit le même mécanisme persistant mais attend `action: "resume"` pour continuer.

## Authentifier l’acteur

Les noms d’acteurs sont des métadonnées fiables fournies par votre application. Outpost ne connecte pas un utilisateur et ne prouve pas qui a cliqué. Authentifiez les utilisateurs et autorisez leurs décisions avant de les transmettre à `start()`.

Une phrase demandant à l’agent d’attendre n’est pas une validation imposée. Le graphe de dépendances doit imposer l’attente.

API : [approvalTask](../../reference/approvaltask/) · [pauseTask](../../reference/pausetask/) · [WorkflowDecision](../../reference/workflowdecision/).
