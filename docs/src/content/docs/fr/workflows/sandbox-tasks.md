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

Une nouvelle tentative peut répéter des effets sur les fichiers ou les services externes. Les tests sont généralement faciles à relancer ; un agent créant des commits ou une mutation d’issue exige une politique réfléchie.
