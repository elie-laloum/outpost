---
title: Approbations et pauses durables
description: Suspendre sur une décision explicite, libérer le processus et reprendre une demande persistée.
sidebar:
  order: 6
---

Utilisez `approvalTask()` pour une étape approuver/refuser et `pauseTask()` pour une étape reprendre/refuser. Ce sont des dépendances ordinaires du graphe reposant sur un [checkpoint](../../../../guide/advanced/checkpoints/). Lorsque l'étape est prête, Outpost persiste sa demande et marque la tâche `paused`. Les tâches indépendantes se terminent normalement ; les dépendantes restent en attente. `start()` renvoie le statut `paused` après la fin des opérations actives et libère le verrou du checkpoint. Aucun minuteur ni processus actif n'est nécessaire pour conserver la demande.

## Créer l'étape

```ts
import {
  approvalTask,
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const build = task({
  key: "build",
  perform: () => ({ artifact: "build-42" }),
});
const approval = approvalTask({
  key: "release-approval",
  after: [build],
  prompt: "Approve publication of build-42?",
  actors: ["release-maintainer"],
});
const publish = task({
  key: "publish",
  after: [build, approval],
  perform(context) {
    const reviewed = context.value(approval);
    return {
      artifact: context.value(build).artifact,
      approvedBy: reviewed.actor,
    };
  },
});
const release = workflow("release", [build, approval, publish]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: ".outpost/workflows" }),
  runId: "release-build-42",
  version: "release-definition-v1",
};
const result = await release.start({ checkpoint });
if (result.status === "paused") {
  const record = result.tasks.find((entry) => entry.key === approval.key)!;
  console.log(result.executionId, record.key, record.pause);
}
```

La dernière tâche de l'exemple renvoie un enregistrement de publication ; remplacez-la par votre opération explicite de publication. Une étape exige un message non vide et une liste non vide d'identifiants d'acteurs autorisés, sans doublons. Elle ne consomme ni tentative ni token et n'accepte aucune condition, politique de réessai ou échéance. Placez les vérifications automatisées dans des tâches normales dont l'approbation dépend.

`result.unwrap()` lève une erreur pour un résultat en pause. Vérifiez `result.status` avant de l'appeler lorsque votre application attend des décisions. Les demandes figurent dans `TaskRecord.pause` avec leur identifiant, type, message, acteurs et date de création. Les valeurs des tâches terminées et l'usage cumulé restent disponibles.

## Décider et reprendre

Dans un processus ultérieur, recréez le même graphe et les mêmes options de checkpoint. Transmettez une décision provenant de votre gestionnaire d'entrée de confiance à `release.start({ checkpoint, decisions: [...] })`. Chaque `WorkflowDecision` contient :

| Champ         | Signification                                                                       |
| ------------- | ----------------------------------------------------------------------------------- |
| `executionId` | L'identifiant d'exécution du résultat en pause.                                     |
| `key`         | La clé de la tâche de décision.                                                     |
| `requestId`   | La valeur exacte de `record.pause.id` persistée.                                    |
| `action`      | `approve` pour une approbation, `resume` pour une pause, ou `reject` pour les deux. |
| `actor`       | Un identifiant présent dans la liste `actors` de l'étape.                           |
| `reason`      | Une explication non vide de la décision.                                            |

Une approbation reprend avec une entrée de cette forme ; remplacez les identifiants par les valeurs persistées :

```ts
import type { WorkflowDecision } from "@elie-laloum/outpost";

const decision: WorkflowDecision = {
  executionId: "execution-id-from-result",
  key: "release-approval",
  requestId: "request-id-from-record",
  action: "approve",
  actor: "release-maintainer",
  reason: "Reviewed the artifact and validation results.",
};
console.log(decision);
```

La liste d'acteurs vérifie la responsabilité déclarée ; elle **n'authentifie pas** la personne qui soumet un identifiant. Votre CLI, service ou interface d'approbation doit authentifier l'appelant et fournir son identité de confiance. Toute personne capable d'appeler la bibliothèque avec un acteur autorisé ou de modifier le stockage des checkpoints est considérée comme digne de confiance. Protégez ces deux accès. Les métadonnées assurent la traçabilité, sans signature cryptographique ni journal d'audit inviolable.

Outpost valide tout le lot avant de modifier une tâche. Les demandes inconnues ou déjà décidées, doublons, identifiants d'exécution ou de demande incompatibles, acteurs non autorisés, motifs vides et tableaux `decisions` explicitement vides sont refusés. Omettez `decisions` pour consulter ou reprendre un état en attente. Les décisions acceptées sont persistées avant tout effet d'une tâche dépendante. Une soumission répétée échoue ; consultez le résultat sauvegardé pour rapprocher une réponse perdue.

L'approbation termine l'étape et rend un `WorkflowDecisionRecord` accessible via `context.value(approval)`. Cet enregistrement comprend la décision et un horodatage `decidedAt` attribué par le serveur ; il reste dans `TaskRecord.decision`. Le refus marque l'étape `rejected`, enregistre l'acteur et le motif, ignore ses dépendantes et produit un workflow en échec. Il reste définitif même avec `checkpoint.resume: "retry-incomplete"` ; utilisez un nouvel identifiant d'exécution persistante `runId` pour une nouvelle décision.

Relancer une exécution en pause sans décision renvoie la même demande. Le temps écoulé n'approuve ni ne reprend jamais une étape. Plusieurs étapes prêtes peuvent rester en attente et leurs décisions peuvent être soumises séparément. Une approbation ne débloque pas une tâche ayant d'autres dépendances en attente.

## Redémarrage et observation

Une pause propre reprend sans `retry-incomplete`, car aucun effet d'une tâche inachevée n'est rejoué. Si le processus a été interrompu pendant une tâche ordinaire active, autorisez explicitement son rejeu avec la politique de checkpoint. Les tâches terminées et décisions acceptées ne sont jamais rejouées. Conservez les mêmes budgets à la reprise : les tentatives et l'usage déclaré cumulés restent pris en compte, y compris avant la pause.

Le type d'étape, le message et la liste d'acteurs font partie de l'identité persistée du graphe. Les modifier, modifier les dépendances ou la version de checkpoint fournie par l'appelant rejette l'exécution existante. Les champs de demande et de décision étendent le format 1 ; les checkpoints ordinaires antérieurs de format 1 restent compatibles. Adaptez les traitements exhaustifs des statuts aux nouveaux statuts de tâche `paused` et `rejected`, ainsi qu'au statut de workflow `paused`.

Les observateurs reçoivent les événements de tâche et de fin pour les pauses, puis de réussite ou de refus lors des décisions. L'observateur OpenTelemetry termine chaque span d'exécution en pause avec un statut neutre et signale le refus comme une erreur. Il n'exporte ni acteur, ni motif, ni message dans les labels de métriques. Un échec indépendant prime toujours sur le statut de pause du workflow ; consultez les enregistrements des tâches pour retrouver les demandes encore en attente.
