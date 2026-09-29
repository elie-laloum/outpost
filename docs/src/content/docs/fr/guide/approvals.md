---
title: "Approbations"
description: "Arrêter un workflow à une gate jusqu’à ce qu’une personne approuve ou rejette, puis le reprendre depuis son checkpoint, même dans un autre processus."
---

## Ajouter une gate

Une gate est une tâche qui attend la décision d’une personne. Les tâches placées après elle s’exécutent dès qu’un acteur autorisé approuve.

```ts
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const approve = defineApprovalTask({
  key: "approve",
  prompt: "Deploy release 1.4 to production?",
  actors: ["maintainer"],
});
const deploy = defineTask({
  key: "deploy",
  after: [approve],
  perform: (context) => `Deployed, approved by ${context.value(approve).actor}`,
});
const workflow = defineWorkflow("release", [approve, deploy]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "release-1.4",
  version: "1",
};

const paused = await workflow.start({ checkpoint });
const request = paused.tasks.find((task) => task.key === "approve")?.pause;
console.log(paused.status, request?.prompt);

// Later, once your application has authenticated the maintainer:
const result = await workflow.start({
  checkpoint,
  decisions: [
    {
      executionId: paused.executionId,
      key: "approve",
      requestId: request!.id,
      actor: "maintainer",
      reason: "Release notes and staging checks reviewed",
      action: "approve",
    },
  ],
});
console.log(result.status, result.value(deploy));
```

<!-- check:run -->

Le script affiche `paused Deploy release 1.4 to production?`, puis `done Deployed, approved by maintainer`.

Une gate exige un checkpoint, l’état sauvegardé de l’exécution, ici sous `.outpost/storage`. Le second `start()` peut tourner dans un autre processus, des jours plus tard.

## Soumettre une décision

<!-- flow -->

1. **Pause**: L’exécution s’arrête à la gate.
   - **Enregistrer la demande**: L’enregistrement de la gate la conserve dans `pause` : `id`, `prompt`, `actors`.
   - **Rendre la main**: Statut `paused`, une fois les tâches indépendantes terminées.
2. **Décider**: Dans votre application.
   - **Présenter la demande**: À une personne listée dans `actors`.
   - **Soumettre**: `start()` avec le même checkpoint et `decisions`.
3. **Poursuivre**: Selon `action`.
   - **Approuver**: Les tâches dépendantes s’exécutent et lisent la décision comme valeur de la gate.
   - **Rejeter**: Les tâches dépendantes sont ignorées et l’exécution se termine en `failed`.

| Champ de la décision | Valeur                                                   |
| -------------------- | -------------------------------------------------------- |
| `executionId`        | `executionId` du résultat en pause                       |
| `key`                | La `key` de la gate                                      |
| `requestId`          | `pause.id` de l’enregistrement de la gate                |
| `actor`              | L’un des `actors` de la gate                             |
| `reason`             | Une explication non vide, conservée dans le checkpoint   |
| `action`             | `"approve"` (ou `"resume"` pour une pause) ou `"reject"` |

`start()` lève une erreur, sans appliquer aucune décision, si l’une d’elles ne correspond pas à la demande en attente.

## Suspendre sans approbation

`definePauseTask()` prend les mêmes options et retient l’exécution jusqu’à ce que quelqu’un la laisse continuer, par exemple après une fenêtre de maintenance. Poursuivez avec `action: "resume"` ou arrêtez avec `"reject"`.

## Authentifier l’acteur

Outpost vérifie que `actor` figure dans `actors`, pas l’identité de la personne. Connectez la personne et vérifiez son droit de décider avant d’appeler `start()`.

Demander à un agent, dans son brief, d’attendre une approbation n’est pas une gate : seule une tâche de gate arrête l’exécution.

## Exiger une décision signée

Avec `authentication: "signed"` sur la gate, une décision doit porter une signature Ed25519 d’une clé liée à son acteur. Seul votre service de signature détient les clés privées ; gardez-les hors des sandboxes des workers.

```ts
import {
  createEd25519DecisionVerifier,
  signWorkflowDecision,
} from "@elie-laloum/outpost";
import type {
  Workflow,
  WorkflowApproverKey,
  WorkflowCheckpointOptions,
  WorkflowDecision,
} from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";

// Signing service, after authenticating the approver.
export function sign(decision: WorkflowDecision, privateKey: KeyObject) {
  return signWorkflowDecision({
    decision,
    privateKey,
    keyId: "maintainer-2026",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
}

// Workflow side: public keys only.
export function submit(
  workflow: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  signed: WorkflowDecision,
  keys: () => Promise<readonly WorkflowApproverKey[]>,
) {
  return workflow.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: createEd25519DecisionVerifier({ keys }),
  });
}
```

La signature couvre tous les champs de la décision, plus `keyId` et `expiresAt`. Chaque `WorkflowApproverKey` lie un `keyId` à un seul `actor` et à sa `publicKey`.

L’expiration est vérifiée avec l’horloge du worker : gardez le service de signature et les workers synchronisés. Les décisions altérées ou expirées, et les clés inconnues, dupliquées ou liées à un autre acteur, sont refusées. Le checkpoint conserve le `keyId` vérifié, et une reprise qui retire `authentication` est refusée.

## Faire tourner les clés des approbateurs

<!-- flow -->

1. **Ajouter**: Publiez la nouvelle clé publique.
   - **La lier**: Un nouveau `keyId` pour le même acteur, à côté de l’ancienne clé.
2. **Basculer**: Signez avec la nouvelle clé privée.
   - **Chevauchement**: Les deux clés vérifient les décisions encore en transit.
3. **Retirer**: Supprimez l’ancienne clé publique.
   - **Révoquer**: Ses nouvelles preuves échouent ; les approbations enregistrées restent valides.

`keys` s’exécute pour chaque décision signée : les changements s’appliquent sans redémarrage.

## Décider d’une exécution lancée par un job

Une [planification cron](../cron-schedules/) ou un [webhook](../webhooks/) exécute son workflow dans un worker de file. La valeur du job indique le `runId`, les `pauses` en attente et la `version` effective du checkpoint, qui ajoute un condensé de l’entrée du job.

Soumettez les décisions avec `checkpoint: { store, runId, version }` issus de cette valeur : voir [Files de jobs et workers](../job-queues/).

## Limites

- Une gate ne prend ni condition, ni retry, ni timeout, ni cache.
- Un job de workflow en file ne reçoit pas de décisions : appelez `start()` hors du worker.
- Modifier le `prompt`, les `actors` ou l’`authentication` d’une gate rend incompatible le checkpoint d’une exécution en pause : reprenez-la avec la gate inchangée.
- Les signatures ne protègent pas le checkpoint : quiconque peut écrire dans son store est de confiance.
- Un `decisionVerifier` personnalisé doit vérifier lui-même la signature, l’acteur et l’expiration.
- Pour les questions que l’agent pose en travaillant, utilisez les [tâches interactives](../interactive-tasks/).

API : [defineApprovalTask](../../reference/defineapprovaltask/) · [definePauseTask](../../reference/definepausetask/) · [WorkflowDecision](../../reference/workflowdecision/) · [signWorkflowDecision](../../reference/signworkflowdecision/) · [createEd25519DecisionVerifier](../../reference/createed25519decisionverifier/) · [WorkflowApproverKey](../../reference/workflowapproverkey/).
