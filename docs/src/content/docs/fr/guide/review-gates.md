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

## Exiger une décision signée

Disponible en 7.0.0 : définissez `authentication: "signed"` sur `approvalTask()` ou `pauseTask()`. Cette exigence participe à l’identité du checkpoint : la retirer à la reprise est refusé. Fournissez `decisionVerifier` lors de la soumission des preuves. Sans cette option, le gate conserve la confiance dans l’acteur fourni par l’application décrite plus haut.

```ts
import { approvalTask } from "@elie-laloum/outpost";

const review = approvalTask({
  key: "review",
  prompt: "Approve deployment?",
  actors: ["maintainer"],
  authentication: "signed",
});
```

Signez la demande exacte après authentification de l’utilisateur et confirmation de son intention. La signature couvre l’exécution, la tâche, la demande, l’acteur, l’action, le motif, l’identifiant de clé et l’expiration. Le service de signature possède la clé privée ; les workers n’ont besoin que des clés publiques de confiance associées aux approbateurs.

```ts
import {
  signWorkflowDecision,
  ed25519DecisionVerifier,
} from "@elie-laloum/outpost";
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowDecision,
  WorkflowApproverKey,
} from "@elie-laloum/outpost";
import type { KeyObject } from "node:crypto";

async function submitSignedReview(
  pipeline: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  decision: WorkflowDecision,
  privateKey: KeyObject,
  keyId: string,
  loadKeys: () => Promise<readonly WorkflowApproverKey[]>,
) {
  const signed = signWorkflowDecision({
    decision,
    privateKey,
    keyId,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  return pipeline.start({
    checkpoint,
    decisions: [signed],
    decisionVerifier: ed25519DecisionVerifier({ keys: loadKeys }),
  });
}
```

La vérification refuse les acteurs non autorisés, décisions altérées, preuves expirées, identifiants de clé inconnus ou dupliqués et demandes réutilisées. Toutes les décisions soumises sont validées avant toute application. L’audit conserve l’identifiant de clé vérifiée et la date de vérification ; aucune clé privée ni aucun jeton bearer n’est stocké.

Les callbacks de vérification doivent répondre rapidement. Si le délai global expire pendant la vérification, le runtime attend la fin du callback mais n’applique pas son approbation tardive.

## Faire tourner les clés des approbateurs

Publiez une nouvelle clé publique avec un `keyId` unique et le même acteur, basculez le service de signature vers sa clé privée, puis retirez l’ancienne clé publique après la période de chevauchement. Le vérificateur recharge les clés à chaque décision. Retirer une clé refuse immédiatement les nouvelles preuves correspondantes ; les approbations déjà persistées restent acceptées, même après expiration. Le stockage des checkpoints reste une frontière de confiance : ces signatures n’authentifient pas le checkpoint lui-même.

Séparez au besoin les contrôles d’accès applicatifs aux clés de signature et à la soumission des décisions. Un `WorkflowDecisionVerifier` personnalisé est du code de confiance et doit vérifier lui-même signature, acteur et expiration. Consultez [l’exploitation des workers](../background-jobs/#exploiter-les-workers) pour les identifiants des files et la reprise.

Pour des questions adaptatives générées par un agent, utilisez les [tâches interactives](../interactive-tasks/). Leurs réponses reprennent la conversation au lieu de terminer une gate prédéfinie.

Une exécution lancée par un [déclencheur](../triggers/#exécuter-le-workflow) indique la `version` de checkpoint à utiliser pour soumettre ses décisions.
