---
title: "Attendre une approbation"
description: "Suspendez un workflow jusqu’à ce qu’une personne autorisée accepte ou refuse l’étape suivante."
---

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
if (!request) throw new Error("No approval is pending");
export const result = await workflow.start({
  checkpoint,
  decisions: [releaseDecision(paused.executionId, request.id)],
});
console.log(result.status, result.value(deploy));
```

<!-- check:run -->

Le script affiche `paused Deploy release 1.4 to production?`, puis `done Deployed, approved by maintainer`.

Une étape d’approbation exige un checkpoint, l’état sauvegardé de l’exécution, ici sous `.outpost/storage`. Le second `start()` peut tourner dans un autre processus, des jours plus tard.

## Soumettre une décision

<!-- canvas -->

- **Pause**: L’exécution s’arrête à l’étape d’approbation.
  - Étapes
  - **Enregistrer la demande**: L’enregistrement de l’étape d’approbation la conserve dans `pause` : `id`, `prompt`, `actors`.
  - **Rendre la main**: Statut `paused`, une fois les tâches indépendantes terminées.
  - → **Décider**: puis
- **Décider**: Dans votre application.
  - Étapes
  - **Présenter la demande**: À une personne listée dans `actors`.
  - **Soumettre**: `start()` avec le même checkpoint et `decisions`.
  - → **Poursuivre**: puis
- **Poursuivre**: Selon `action`.
  - Étapes
  - **Approuver**: Les tâches dépendantes s’exécutent et lisent la décision comme valeur de l’étape d’approbation.
  - **Rejeter**: Les tâches dépendantes sont ignorées et l’exécution se termine en `failed`.

Référence API : [WorkflowDecision](../../reference/workflowdecision/).

`start()` lève une erreur, sans appliquer aucune décision, si l’une d’elles ne correspond pas à la demande en attente.

## Suspendre sans approbation

`definePauseTask()` prend les mêmes options et retient l’exécution jusqu’à ce que quelqu’un la laisse continuer, par exemple après une fenêtre de maintenance. Poursuivez avec `action: "resume"` ou arrêtez avec `"reject"`.

## Authentifier l’acteur

Outpost vérifie que `actor` figure dans `actors`, pas l’identité de la personne. Connectez la personne et vérifiez son droit de décider avant d’appeler `start()`.

Demander à un agent, dans son brief, d’attendre une approbation n’est pas une étape d’approbation : seule une tâche d’étape d’approbation arrête l’exécution.

## Exiger une décision signée

Avec `authentication: "signed"` sur l’étape d’approbation, une décision doit porter une signature Ed25519 d’une clé liée à son acteur. Seul votre service de signature détient les clés privées ; gardez-les hors des sandboxes des workers.

<!-- tabs -->

```ts title="sign.ts"
import type { WorkflowDecision } from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";
import { signWorkflowDecision } from "@elie-laloum/outpost";

export function sign(decision: WorkflowDecision, privateKey: KeyObject) {
  return signWorkflowDecision({
    decision,
    privateKey,
    keyId: "maintainer-2026",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
}
```

```ts title="submission.types.ts"
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowDecision,
  WorkflowApproverKey,
} from "@elie-laloum/outpost";

export interface SignedSubmission {
  workflow: Workflow;
  checkpoint: WorkflowCheckpointOptions;
  signed: WorkflowDecision;
  keys: () => Promise<readonly WorkflowApproverKey[]>;
}
```

```ts title="submit.ts"
import type { SignedSubmission } from "./submission.types.ts";
import { createEd25519DecisionVerifier } from "@elie-laloum/outpost";

export function submit({
  workflow,
  checkpoint,
  signed,
  keys,
}: SignedSubmission) {
  return workflow.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: createEd25519DecisionVerifier({ keys }),
  });
}
```

La signature couvre tous les champs de la décision, plus `keyId` et `expiresAt`. Chaque `WorkflowApproverKey` lie un `keyId` à un seul `actor` et à sa `publicKey`.

L’expiration est vérifiée avec l’horloge du worker : gardez le service de signature et les workers synchronisés. Les décisions altérées ou expirées, et les clés inconnues, dupliquées ou liées à un autre acteur, sont refusées. Le checkpoint conserve le `keyId` vérifié, et une reprise qui retire `authentication` est refusée.

## Renouveler les clés des approbateurs

<!-- canvas -->

- **Ajouter**: Publiez la nouvelle clé publique.
  - Étapes
  - **La lier**: Un nouveau `keyId` pour le même acteur, à côté de l’ancienne clé.
  - → **Basculer**: puis
- **Basculer**: Signez avec la nouvelle clé privée.
  - Étapes
  - **Chevauchement**: Les deux clés vérifient les décisions encore en transit.
  - → **Retirer**: puis
- **Retirer**: Supprimez l’ancienne clé publique.
  - Étapes
  - **Révoquer**: Ses nouvelles preuves échouent ; les approbations enregistrées restent valides.

`keys` s’exécute pour chaque décision signée : les changements s’appliquent sans redémarrage.

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
