---
title: "Composer des workflows typés"
description: "Reliez les résultats des tâches et choisissez le type de tâche adapté à chaque étape."
---

## Relier les étapes

Utilisez un workflow lorsque votre travail comporte plusieurs étapes avec des dépendances explicites. Chaque tâche renvoie une valeur que les tâches suivantes peuvent lire en conservant son type TypeScript.

<!-- features -->

- [Tâches et dépendances](../task-dependencies/): Déclarez chaque étape, reliez les sorties, lancez le graphe.
- [Boucles de vérification](../verification-loops/): Laissez l’agent réessayer avec le retour de la vérification jusqu’à ce qu’elle accepte.
- [Réponses typées](../typed-responses/): Demandez une réponse JSON balisée et validez-la avant de l’utiliser.
- [Concurrence, relances et délais](../concurrency-and-retries/): Branches parallèles, relances après un échec et durées limitées.
- [Cache de résultats](../task-cache/): Renvoyez la valeur enregistrée d’une tâche au lieu de la relancer.
- [Artefacts](../artifacts/): Transmettez des fichiers, et pas seulement des valeurs, d’une tâche à la suivante.
  - empreintes

## Vérifier le résultat d’une tâche

Dans cet exemple, une première tâche prépare la liste des fichiers. Une tâche de boucle essaie ensuite de produire un résultat accepté par sa vérification. Les dépendances indiquent dans quel ordre ces tâches peuvent démarrer.

<!-- tabs -->

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";

export const plan = defineTask({
  key: "plan",
  perform: () => ({ files: ["src/parser.ts"] }),
});
```

```ts title="fix.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";

export const fix = defineLoopTask({
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
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { fix } from "./fix.ts";

export const result = await defineWorkflow("fix-parser", [plan, fix]).start();
result.unwrap();
reportValue(result.value(fix));
// Example output: { files: [ 'src/parser.ts' ], round: 2 }
```

<!-- check:run -->

Rien ne s’exécute avant `start()`. Le premier tour est rejeté, le second reçoit le retour et passe, et `result.value(fix)` conserve le type renvoyé par `attempt`.

## Choisir un type de tâche

| Tâche                  | Exécute                                                  | Renvoie                                   |
| ---------------------- | -------------------------------------------------------- | ----------------------------------------- |
| `defineTask()`         | Votre propre fonction                                    | Ce qu’elle renvoie                        |
| `defineAgentTask()`    | Un agent sur le workspace partagé                        | Son texte, ses commits et sa valeur typée |
| `defineIsolatedTask()` | Un agent dans sa propre sandbox et son worktree          | La même chose, par dépôt                  |
| `defineLoopTask()`     | Tentative et vérification, jusqu’à acceptation           | Le candidat accepté                       |
| `defineApprovalTask()` | Une [approbation](../approvals/) donnée par une personne | La décision enregistrée                   |

Pour un [workflow avec checkpoint](../durable-runs/), renvoyez des valeurs qui peuvent être enregistrées et restaurées en JSON sans perdre d’information. Le processus suivant pourra alors reprendre à partir des résultats sauvegardés.

## Limites

- `context.value()` lève une erreur pour une tâche absente de `after`, même si elle a déjà tourné.
- Une tâche ne démarre qu’une fois toutes celles de son `after` terminées ; `defineWorkflow()` refuse les cycles et les dépendances inconnues avant l’exécution.
- Un rejet au dernier tour fait échouer la tâche de boucle avec `LoopTaskExhausted`.
- Pour enregistrer les résultats dans un checkpoint, utilisez des valeurs qui peuvent être restaurées depuis le JSON sans perte. Les instances de classes, les flux et les descripteurs ne conviennent pas.
- Un workflow ne pousse, ne fusionne et ne déploie rien de lui-même. Ces étapes restent dans vos tâches.

API : [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [defineLoopTask](../../reference/definelooptask/) · [TaskContext](../../reference/taskcontext/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [defineJsonResponse](../../reference/definejsonresponse/).
