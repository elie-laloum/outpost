---
title: "Tâches et dépendances"
description: "Relier des sorties typées dans un graphe exécutable."
---

`defineTask()` définit un nœud. `defineWorkflow()` valide le graphe. Rien ne s’exécute avant `start()`.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const files = defineTask({ key: "files", perform: () => ["src/parser.ts"] });
const report = defineTask({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await defineWorkflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

## Lire une dépendance

Déclarez les dépendances dans `after`, puis lisez leurs valeurs typées avec `context.value(task)`. Incluez chaque dépendance dans la liste des tâches du workflow. Les clés dupliquées, dépendances absentes et cycles sont rejetés avant l’exécution.

Les tâches indépendantes peuvent tourner en parallèle. Les tâches dépendantes démarrent après la réussite de leurs dépendances. `diagram()` renvoie une représentation Mermaid pour inspecter le graphe.

## Choisir un type de tâche

| Fabrique             | Usage                                                    |
| -------------------- | -------------------------------------------------------- |
| `defineLoopTask`     | Essais bornés avec feedback de vérification.             |
| `defineTask`         | Code applicatif renvoyant une valeur.                    |
| `defineAgentTask`    | Requête d’agent dans une sandbox existante.              |
| `defineCommandTask`  | Commande dans une sandbox existante.                     |
| `defineIsolatedTask` | Requête d’agent avec son propre cycle de vie de sandbox. |
| `defineQueuedTask`   | Travail délégué à un handler enregistré en arrière-plan. |

Un workflow ne crée pas de transaction Git commune. Chaque tâche doit respecter la propriété des ressources et l’annulation. Utilisez l’[ordonnancement](../concurrency-and-retries/) pour contrôler concurrence et reprises.

API : [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/).

Utilisez les [boucles de vérification](../verification-loops/) lorsqu’un contrôle échoué doit guider un nouvel essai. Ajoutez un [cache de tâches](../task-cache/) pour réutiliser un résultat JSON lorsque les entrées de la tâche n’ont pas changé.
