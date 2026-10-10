---
title: "Votre premier workflow"
description: "Relier une tâche d’agent à une fonction et examiner leur résultat typé."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="relier-deux-tâches"></span>
<span id="exécuter-le-script"></span>
<span id="lire-les-dépendances-et-les-résultats"></span>
<span id="ajouter-une-vérification"></span>

## Transmettre la réponse de l’agent à votre code

Après [votre première tâche](../first-request/), ajoutez une étape qui lit son résultat. Ce tutoriel reprend le même README commité et la même [configuration](../setup/), sans tests en échec ni checkpoint à préparer.

Enregistrez ces trois fichiers à côté de `outpost.config.ts`. Le premier déclare la tâche de l’agent, le deuxième construit un résumé et le dernier démarre le workflow.

<!-- tabs -->

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/workflow-review" },
    brief: { text: "Summarize the README setup steps without editing files." },
  }),
});
```

```ts title="summary.ts"
import { defineTask } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";

export const summary = defineTask({
  key: "summary",
  after: [review],
  perform: (context) => ({
    text: context.value(review).text,
    branch: context.value(review).branch,
    commits: context.value(review).commits.length,
  }),
});
```

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";
import { summary } from "./summary.ts";

const result = await defineWorkflow("readme-review", [review, summary]).start();
result.unwrap();
console.log(result.value(summary));
// Example output: { text: 'Install ...', branch: 'outpost/workflow-review', commits: 0 }
```

## Lancer le workflow

L’agent lit d’abord le README. Si sa tâche réussit, votre fonction `summary` s’exécute et le script affiche son résultat.

```sh
node workflow.ts
```

Examinez la réponse, le nom de branche et le nombre de commits. `unwrap()` lève une erreur si le workflow n’a pas réussi : le script n’affiche donc pas un résumé de réussite après une tâche en échec. Cet exemple ne demande aucune modification et n’intègre jamais la branche.

## Comprendre la dépendance

`after: [review]` fait attendre `summary` et lui permet de lire `context.value(review)` avec le bon type TypeScript. Déclarer les tâches ne les exécute pas : `.start()` lance le graphe. La tâche isolée ouvre et ferme sa propre sandbox ; votre résumé s’exécute dans le processus Node.js.

Les résultats de cette exécution restent en mémoire. Un workflow avec checkpoint exige des sorties JSON pour chaque tâche enregistrée, y compris celle de l’agent : consultez [Enregistrer et reprendre un workflow](../durable-runs/) lorsque vous en avez besoin.

## Aller plus loin

[Tâches et dépendances](../task-dependencies/) présente les autres types de tâches et leurs résultats. Ajoutez une [boucle de vérification](../verification-loops/) pour qu’un vrai test décide de l’acceptation du travail, puis des [tests hors ligne](../testing-workflows/) pour vérifier votre logique sans appel au modèle.

API : [defineIsolatedTask](../../reference/defineisolatedtask/) · [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/).
