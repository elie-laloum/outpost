---
title: "Dépendances des tâches"
description: "Relier des sorties typées dans un graphe exécutable."
---

`task()` définit un nœud. `workflow()` valide le graphe. Rien ne s’exécute avant `start()`.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const files = task({ key: "files", perform: () => ["src/parser.ts"] });
const report = task({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await workflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

## Lire une dépendance

Déclarez les dépendances dans `after`, puis lisez leurs valeurs typées avec `context.value(task)`. Incluez chaque dépendance dans la liste des tâches du workflow. Les clés dupliquées, dépendances absentes et cycles sont rejetés avant l’exécution.

Les tâches indépendantes peuvent tourner en parallèle. Les tâches dépendantes démarrent après la réussite de leurs dépendances. `diagram()` renvoie une représentation Mermaid pour inspecter le graphe.

## Choisir un type de tâche

| Fabrique       | Usage                                                    |
| -------------- | -------------------------------------------------------- |
| `loopTask`     | Essais bornés avec feedback de vérification.             |
| `task`         | Code applicatif renvoyant une valeur.                    |
| `agentTask`    | Requête d’agent dans une sandbox existante.              |
| `commandTask`  | Commande dans une sandbox existante.                     |
| `isolatedTask` | Requête d’agent avec son propre cycle de vie de sandbox. |
| `queuedTask`   | Travail délégué à un handler enregistré en arrière-plan. |

Un workflow ne crée pas de transaction Git commune. Chaque tâche doit respecter la propriété des ressources et l’annulation. Utilisez l’[ordonnancement](../task-scheduling/) pour contrôler concurrence et reprises.

API : [task](../../reference/task/) · [workflow](../../reference/workflow/) · [TaskContext](../../reference/taskcontext/).

Utilisez les [boucles de vérification](../verification-loops/) lorsqu’un contrôle échoué doit guider un nouvel essai.
