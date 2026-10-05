---
title: "Votre premier workflow"
description: "Lancez une tâche d’agent, transmettez son résultat à une seconde tâche et récupérez la sortie du workflow."
---

## Relier deux tâches

Un workflow décrit des tâches et leurs dépendances. Dans cet exemple, un agent corrige les tests sur une branche séparée. Une seconde tâche lit son résultat et renvoie un court résumé.

Reprenez la configuration de la page [Installation](../setup/) et enregistrez ces trois fichiers à côté. Chaque onglet présente un fichier : la tâche de l’agent, la tâche de synthèse et le script qui les exécute.

<!-- tabs -->

```ts title="fix-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const fix = defineIsolatedTask({
  key: "fix",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests, run them and commit the fix." },
  }),
});
```

```ts title="summary.ts"
import { defineTask } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";

export const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});
```

```ts title="fix.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";
import { summary } from "./summary.ts";

export const result = await defineWorkflow("fix-tests", [fix, summary]).start();
result.unwrap();
reportValue(result.value(summary));
// Example output: { branch: 'outpost/fix-tests', commits: 1 }
```

## Exécuter le script

L’agent travaille sur `outpost/fix-tests`. Lorsqu’il termine avec succès, la tâche `summary` renvoie le nom de la branche et le nombre de commits. Ce nombre dépend des modifications produites par l’agent.

```sh
node fix.ts
```

Examinez la branche avant de la fusionner. Un workflow réussi signifie que ses tâches ont terminé sans erreur ; cet exemple ne vérifie pas lui-même que les tests passent.

## Lire les dépendances et les résultats

`defineIsolatedTask()` lance l’agent dans sa propre sandbox. `defineTask()` exécute votre fonction. Ces déclarations ne lancent rien avant l’appel à la méthode `start()` du workflow.

`after: [fix]` indique que `summary` doit attendre `fix`. Cette déclaration lui permet aussi de lire la sortie de la première tâche avec `context.value(fix)`, en conservant son type TypeScript.

`result.unwrap()` lève une erreur si le workflow n’a pas terminé avec succès. Après cet appel, `result.value(summary)` vous donne le résumé. La page [Relier les tâches et leurs dépendances](../task-dependencies/) détaille les échecs, les tâches ignorées et l’exécution en parallèle.

## Ajouter une vérification

Pour que le résultat des tests décide si le travail est accepté, ajoutez une [boucle de vérification](../verification-loops/). Pour attendre la décision d’une personne, ajoutez une [tâche d’approbation](../approvals/).

Si le workflow doit reprendre dans un autre processus, [enregistrez sa progression](../durable-runs/) dans un checkpoint. Vous pouvez ajouter ces fonctions au même ensemble de tâches.

API : [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/).
