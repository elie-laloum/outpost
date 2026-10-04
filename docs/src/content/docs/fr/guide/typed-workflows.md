---
title: "Workflows typés"
description: "Enchaîner des tâches qui se passent des résultats typés, boucler jusqu’à ce qu’une vérification accepte le travail, lancer les branches indépendantes en parallèle et lire chaque sortie depuis un seul résultat."
---

## D’une tâche à un graphe

Un workflow est une liste de tâches ordonnée par leurs dépendances. Chaque tâche renvoie une valeur, et la suivante la lit sans perdre son type.

<!-- features -->

- [Tâches et dépendances](../task-dependencies/): Déclarez chaque étape, reliez les sorties, lancez le graphe.
  - `defineTask()`
  - `defineWorkflow()`
- [Boucles de vérification](../verification-loops/): Laissez l’agent réessayer avec le retour de la vérification jusqu’à ce qu’elle accepte.
  - `defineLoopTask()`
  - `maxRounds`
- [Réponses typées](../typed-responses/): Demandez une réponse JSON balisée et validez-la avant de l’utiliser.
  - `defineJsonResponse()`
  - `result.value`
- [Concurrence, relances et délais](../concurrency-and-retries/): Branches parallèles, relances après un échec et durées bornées.
  - `concurrency`
  - `retries`
- [Cache de résultats](../task-cache/): Renvoyez la valeur enregistrée d’une tâche au lieu de la relancer.
  - `cache`
  - `repositoryFingerprint()`
- [Artefacts](../artifacts/): Transmettez des fichiers, et pas seulement des valeurs, d’une tâche à la suivante.
  - `defineJsonArtifact()`
  - empreintes

## Vérifier avant de garder le travail

`defineTask()` prépare l’entrée, `defineLoopTask()` répète une tentative jusqu’à ce que sa vérification accepte, et `defineWorkflow()` les exécute dans l’ordre.

```ts
import {
  defineLoopTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const plan = defineTask({
  key: "plan",
  perform: () => ({ files: ["src/parser.ts"] }),
});
const fix = defineLoopTask({
  key: "fix",
  after: [plan],
  maxRounds: 3,
  attempt: (context) => ({
    files: context.value(plan).files,
    round: context.round,
  }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});

const result = await defineWorkflow("fix-parser", [plan, fix]).start();
result.unwrap();
console.log(result.value(fix)); // { files: [ 'src/parser.ts' ], round: 2 }
```

<!-- check:run -->

Rien ne s’exécute avant `start()`. Le premier tour est rejeté, le second reçoit le retour et passe, et `result.value(fix)` conserve le type renvoyé par `attempt`.

## Choisir un type de tâche

| Tâche                  | Exécute                                           | Renvoie                                   |
| ---------------------- | ------------------------------------------------- | ----------------------------------------- |
| `defineTask()`         | Votre propre fonction                             | Ce qu’elle renvoie                        |
| `defineAgentTask()`    | Un agent sur le workspace partagé                 | Son texte, ses commits et sa valeur typée |
| `defineIsolatedTask()` | Un agent dans sa propre sandbox et son worktree   | La même chose, par dépôt                  |
| `defineLoopTask()`     | Tentative et vérification, jusqu’à acceptation    | Le candidat accepté                       |
| `defineApprovalTask()` | Une [gate](../approvals/) qui attend une personne | La décision enregistrée                   |

Les résultats sont du JSON sans perte : une [exécution durable](../durable-runs/) peut s’arrêter entre deux tâches et reprendre où elle en était.

## Limites

- `context.value()` lève une erreur pour une tâche absente de `after`, même si elle a déjà tourné.
- Une tâche ne démarre qu’une fois toutes celles de son `after` terminées ; un cycle ou une dépendance inconnue est une erreur de configuration au `start()`.
- Un rejet au dernier tour fait échouer la tâche de boucle avec `LoopTaskExhausted`.
- Les valeurs de tâche doivent survivre à un aller-retour JSON. Gardez-en dehors les instances de classes, les flux et les descripteurs.
- Un workflow ne pousse, ne fusionne et ne déploie rien de lui-même. Ces étapes restent dans vos tâches.

API : [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [defineLoopTask](../../reference/definelooptask/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [defineJsonResponse](../../reference/definejsonresponse/).
