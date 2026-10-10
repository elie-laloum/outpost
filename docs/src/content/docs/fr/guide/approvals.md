---
title: "Attendre une approbation"
description: "Suspendez un workflow jusqu’à ce qu’une personne autorisée accepte ou refuse l’étape suivante."
---

Enregistrez les quatre fichiers ci-dessous ensemble et lancez `node release.ts` dans un projet ESM avec Outpost installé. Cette démonstration hors ligne soumet immédiatement une décision d’exemple ; dans une application, remplacez-la par celle de l’utilisateur authentifié. Aucun service n’est déployé.

## Ajouter une étape d’approbation

Ajoutez une tâche d’approbation avant une étape qui demande l’accord d’une personne, par exemple une fusion ou un déploiement. Le workflow se met en pause à cette tâche ; les tâches qui en dépendent attendent l’accord d’un acteur autorisé.

<!-- tabs -->

```ts title="release-tasks.ts"
import {
  defineApprovalTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

export const approve = defineApprovalTask({
  key: "approve",
  prompt: "Deploy release 1.4 to production?",
  actors: ["maintainer"],
});
export const deploy = defineTask({
  key: "deploy",
  after: [approve],
  perform: (context) => `Deployed, approved by ${context.value(approve).actor}`,
});
export const workflow = defineWorkflow("release", [approve, deploy]);
```

```ts title="release-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "release-1.4",
  version: "1",
};
```

```ts title="release-decision.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";

export function releaseDecision(
  executionId: string,
  requestId: string,
): WorkflowDecision {
  return {
    executionId,
    key: "approve",
    requestId,
    actor: "maintainer",
    reason: "Release notes and staging checks reviewed",
    action: "approve",
  };
}
```

```ts title="release.ts"
import { workflow, deploy } from "./release-tasks.ts";
import { checkpoint } from "./release-checkpoint.ts";
import { releaseDecision } from "./release-decision.ts";

export const paused = await workflow.start({ checkpoint });
export const request = paused.tasks.find(
  (task) => task.key === "approve",
)?.pause;
console.log(paused.status, request?.prompt);
// Example output: paused Deploy release 1.4 to production?
if (!request) throw new Error("No approval is pending");
export const result = await workflow.start({
  checkpoint,
  decisions: [releaseDecision(paused.executionId, request.id)],
});
console.log(result.status, result.value(deploy));
// Example output: done Deployed, approved by maintainer
```

<!-- check:run -->

Le script affiche `paused Deploy release 1.4 to production?`, puis `done Deployed, approved by maintainer`.

Une étape d’approbation exige un checkpoint, l’état sauvegardé de l’exécution, ici sous `.outpost/storage`. Le second `start()` peut tourner dans un autre processus, des jours plus tard.

## Soumettre une décision

<!-- canvas -->

- **Demande**: Enregistrer la demande et attendre une personne autorisée.
  - Workflow
  - → **Décision**: demande affichée
- **Décision**: Votre application transmet le choix et son motif.
  - Votre application
  - → **Suite**: approuvé
  - → **Arrêt**: refusé
- **Suite**: Exécuter les tâches dépendantes.
  - Workflow
- **Arrêt**: Ignorer les tâches dépendantes ; le workflow est refusé.
  - Workflow

Le rejet et son motif survivent à la reprise du checkpoint. Les branches indépendantes suivent toujours l’ordonnancement normal ; si l’une échoue techniquement, le workflow renvoie `failed` avec le code de terminaison de cet échec.

Référence API : [WorkflowDecision](../../reference/workflowdecision/).

`start()` lève une erreur, sans appliquer aucune décision, si l’une d’elles ne correspond pas à la demande en attente.

## Suspendre sans approbation

`definePauseTask()` prend les mêmes options et retient l’exécution jusqu’à ce que quelqu’un la laisse continuer, par exemple après une fenêtre de maintenance. Poursuivez avec `action: "resume"` ou arrêtez avec `"reject"`.

## Authentifier l’acteur

Outpost vérifie que `actor` figure dans `actors`, pas l’identité de la personne. Connectez la personne et vérifiez son droit de décider avant d’appeler `start()`.

Demander à un agent, dans son brief, d’attendre une approbation n’est pas une étape d’approbation : seule une tâche d’étape d’approbation arrête l’exécution.

## Approuver une exécution lancée par un job

Une [planification cron](../cron-schedules/) ou un [webhook](../webhooks/) exécute son workflow dans un worker de file. La valeur du job indique le `runId`, les `pauses` en attente et la `version` effective du checkpoint, qui ajoute un condensé de l’entrée du job.

Soumettez les décisions avec `checkpoint: { store, runId, version }` issus de cette valeur : voir [Files de jobs et workers](../job-queues/).

## Limites

- Une étape d’approbation ne prend ni condition, ni retry, ni timeout, ni cache.
- Un job de workflow en file ne reçoit pas de décisions : appelez `start()` hors du worker.
- Modifier le `prompt`, les `actors` ou l’`authentication` d’une étape d’approbation rend incompatible le checkpoint d’une exécution en pause : reprenez-la avec l’étape d’approbation inchangée.
- Les signatures ne protègent pas le checkpoint : quiconque peut écrire dans son stockage est de confiance.
- Un `decisionVerifier` personnalisé doit vérifier lui-même la signature, l’acteur et l’expiration.
- Pour les questions que l’agent pose en travaillant, utilisez les [tâches interactives](../interactive-tasks/).

API : [defineApprovalTask](../../reference/defineapprovaltask/) · [definePauseTask](../../reference/definepausetask/) · [WorkflowDecision](../../reference/workflowdecision/) · [signWorkflowDecision](../../reference/signworkflowdecision/) · [createEd25519DecisionVerifier](../../reference/createed25519decisionverifier/) · [WorkflowApproverKey](../../reference/workflowapproverkey/).

## Pour continuer

- [Exiger des décisions signées](../signed-approvals/)

<span id="exiger-une-décision-signée"></span>
<span id="renouveler-les-clés-des-approbateurs"></span>
