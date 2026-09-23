---
title: "Relier workflows et sandboxes"
description: "Relier workflows et sandboxes — Outpost"
sidebar:
  order: 3
---

Trois fabriques relient le graphe aux opérations de sandbox. Elles transmettent automatiquement le signal du workflow.

| Fabrique       | Propriété des ressources                | Sortie                                                         |
| -------------- | --------------------------------------- | -------------------------------------------------------------- |
| `agentTask`    | Utilise une sandbox active fournie      | Résultat du dispatch                                           |
| `commandTask`  | Utilise une sandbox active fournie      | Résultat de commande ; un statut non nul fait échouer la tâche |
| `isolatedTask` | Crée et ferme un environnement ponctuel | Résultat du dispatch                                           |

```ts
import {
  createSandbox,
  codex,
  agentTask,
  commandTask,
  workflow,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({ agent: codex() });
const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({ brief: { text: "Ajoute la validation et les tests." } }),
});
const verify = commandTask({
  key: "verify",
  after: [implement],
  sandbox,
  command: { executable: "npm", arguments: ["test"] },
});
(await workflow("delivery", [implement, verify]).start()).unwrap();
```

`request(context)` peut utiliser les résultats typés des dépendances. `command` accepte un `Command` ou une fonction du contexte. Les options habituelles (`after`, `condition`, `retry`, `timeoutMs`) restent disponibles.

Sérialisez les tâches partageant une sandbox avec `after`. Pour des agents parallèles, utilisez `isolatedTask` avec des branches nommées distinctes. Chaque requête fournit agent, brief et configuration du provider/workspace.

Une nouvelle tentative peut répéter des effets sur les fichiers ou les services externes. Les tests sont généralement faciles à relancer ; un agent créant des commits exige une politique réfléchie.

## Plusieurs dépôts

Un workflow peut vivre dans `/path2/workflow1` et orchestrer des dépôts externes. Chaque tâche isolée sélectionne son propre `repository` ; une sandbox possède un seul dépôt. Les tâches peuvent dépendre les unes des autres ou s’exécuter en parallèle si elles sont indépendantes.

Dans le `run.ts` généré, conservez le chargement du `.env` et la configuration `runtime`. Remplacez l’import de `dispatch` par `isolatedTask, workflow`, puis le dispatch final par :

```js
const backend = isolatedTask({
  key: "backend",
  request: () => ({
    ...runtime,
    repository: "/path1/repository",
    branch: { mode: "named", name: "outpost/backend" },
    brief: { text: "Implement the API change, test and commit." },
  }),
});
const frontend = isolatedTask({
  key: "frontend",
  after: [backend],
  request: () => ({
    ...runtime,
    repository: "/path3/another-repository",
    branch: { mode: "named", name: "outpost/frontend" },
    brief: { text: "Adapt the frontend, test and commit." },
  }),
});
(await workflow("workflow1", [backend, frontend]).start()).unwrap();
```

Les commits restent sur les branches nommées de chaque dépôt. Les worktrees gérés et les logs sont stockés dans le `.outpost` de chaque dépôt ciblé ; les worktrees propres sont supprimés à la fermeture réussie. Il n’y a pas de transaction Git commune aux dépôts : une tâche réussie n’est pas annulée si la suivante échoue.

`after: [backend]` impose l’ordre d’exécution, mais ne copie ni fichiers ni commits vers le dépôt frontend. Utilisez `request(context)` et `context.value(backend)` pour transmettre explicitement le résultat du backend dans le brief suivant. Les tâches indépendantes peuvent être parallèles ; celles partageant une sandbox doivent être sérialisées. Pour les chemins et l’emplacement des fichiers, consultez [choisir un dépôt](../../sandboxes/repositories/).
