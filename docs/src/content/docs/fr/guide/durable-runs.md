---
title: "Exécutions durables"
description: "Enregistrer la progression d’un workflow dans un checkpoint, la reprendre après un échec, une pause ou un plantage, et récupérer une exécution dont le processus s’est arrêté."
---

## Enregistrer la progression

Passez un `checkpoint` à `start()`. Outpost enregistre l’exécution sous `runId` à chaque changement d’état d’une tâche.

```ts
import {
  createLocalTransport,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const scan = defineTask({ key: "scan", perform: () => ({ files: 12 }) });
const result = await defineWorkflow("scan", [scan]).start({
  checkpoint: { store, runId: "scan-2026-09", version: "1" },
});
result.unwrap();
console.log(result.value(scan));
```

<!-- check:run -->

Le script affiche `{ files: 12 }` et enregistre le checkpoint sous `.outpost/storage`. Relancez-le : `scan` ne s’exécute pas, sa valeur vient du checkpoint.

<!-- features -->

- **Enregistrements des tâches**: Statut, tentatives, erreurs, demandes et décisions des gates de chaque tâche.
- **Sorties**: La valeur de chaque tâche `done`, restaurée au lieu d’exécuter la tâche à nouveau.
- **Consommation**: Tentatives et tokens cumulés, pour qu’un [budget](../budgets/) couvre toutes les reprises.

Une exécution reprise garde son `executionId` : `context.idempotencyKey` reste donc identique pour chaque tâche. Les sandboxes, leurs fichiers et le code des tâches ne sont pas enregistrés : reprenez en appelant `start()` sur la même définition de workflow.

## Renvoyer des sorties JSON

Une tâche avec checkpoint doit renvoyer du JSON sans perte ou `undefined`. Sinon, la tentative échoue. Convertissez les dates en chaînes et ne gardez que les champs utiles.

Un résultat de dispatch porte des méthodes comme `resume()`. Projetez-le dans une `defineTask`, comme dans [D’une tâche à un workflow](../first-workflow/) :

```ts
import { defineIsolatedTask, defineTask } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const agent = defineIsolatedTask({
  key: "fix-agent",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Fix the failing tests and commit the fix." },
  }),
});
export const fix = defineTask({
  key: "fix",
  perform: async (context) => {
    const { branch, commits } = await agent.perform(context);
    return { branch, commits, finishedAt: new Date().toISOString() };
  },
});
```

Un checkpoint est limité à 16 Mio. Stockez les contenus volumineux comme [artefacts](../artifacts/) et renvoyez leur référence.

## Conserver l’identité du checkpoint

Un checkpoint ne reprend que le workflow qui l’a écrit. `start()` refuse un checkpoint dont l’identité diffère.

| Élément de l’identité | Où vous le définissez                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| Nom du workflow       | `defineWorkflow(name, tasks)`                                                |
| Version               | `checkpoint.version`                                                         |
| Graphe                | Clés des tâches et leurs dépendances `after`                                 |
| Réglages d’exécution  | `timeoutMs`, réglages de `retry`, présence de `condition` ou `retry.accepts` |
| Gates                 | Type, `prompt`, `actors` et `authentication` de chaque approbation ou pause  |
| Tâches en boucle      | `maxRounds`                                                                  |
| Tâches interactives   | `actors`, agent, modèle, brief, dépôt, `maxTurns` et provider de sandbox     |

Le reste du code des tâches, les briefs et les entrées du workflow n’en font pas partie : changez `version` quand vous les modifiez. Une exécution enregistrée ne peut pas changer d’identité, pas même de `version` : relancez-la sous un nouveau `runId`.

Le `budget` du workflow ne fait pas non plus partie de l’identité.

Pour réutiliser des résultats entre exécutions différentes, utilisez plutôt le [cache de résultats](../task-cache/).

## Reprendre le travail inachevé

Une exécution terminée sur une tâche en échec, annulée ou interrompue ne reprend qu’avec `resume: "retry-incomplete"`. Cette option autorise à exécuter ces tâches à nouveau, avec leurs effets de bord.

```ts
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
let calls = 0;
const upload = defineTask({
  key: "upload",
  perform: () => {
    calls += 1;
    if (calls === 1) throw new Error("Network unavailable");
    return { uploaded: true };
  },
});
const workflow = defineWorkflow("upload", [upload]);
const checkpoint = { store, runId: "upload-1", version: "1" };

console.log((await workflow.start({ checkpoint })).status);
const resumed = await workflow.start({
  checkpoint: { ...checkpoint, resume: "retry-incomplete" },
});
console.log(resumed.status);
```

<!-- check:run -->

Le script affiche `failed`, puis `done`. Sans `resume`, le second `start()` est refusé.

| État enregistré                                   | Sans `resume`                                  | Avec `resume: "retry-incomplete"`                  |
| ------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| Toutes les tâches `done` ou `skipped`             | Renvoie le résultat enregistré, n’exécute rien | Identique                                          |
| En pause sur une gate ou en attente d’une réponse | Continue avec vos décisions ou réponses        | Identique                                          |
| En pause sur un [quota](../quota-pauses/)         | Relance la tâche après la réinitialisation     | Identique                                          |
| Une tâche `failed`, `cancelled` ou interrompue    | `start()` est refusé                           | La relance, ainsi que les tâches qu’elle a sautées |

Une tâche relancée repart pour une nouvelle série de tentatives `retry`. Une tâche `done` ne s’exécute jamais à nouveau. Une exécution arrêtée par son [budget](../budgets/) reprend de la même façon ; passez un `budget` plus large, car la consommation continue de s’additionner.

## Récupérer une exécution après un plantage

Une exécution possède son checkpoint pendant `start()` et le libère quand `start()` se termine. Si le processus meurt, la propriété reste : tout `start()` suivant pour ce `runId` est refusé jusqu’à ce que vous la libériez.

<!-- flow -->

1. **Arrêter**: Assurez-vous que l’ancien runner n’écrit plus.
   - **Arrêter le processus**: Confirmez qu’il s’est terminé. Un PID ne prouve pas qu’un runner distant s’est arrêté.
2. **Déverrouiller**: Libérez la propriété, gardez la progression.
   - **Lire la révision**: Lisez l’objet du checkpoint de l’exécution depuis le transport.
     - `Transport`
   - **Libérer la propriété**: L’appel est refusé si l’objet a changé depuis votre lecture.
     - `recoverWorkflowCheckpoint()`
3. **Reprendre**: Relancez le même workflow avec le même checkpoint.
   - **Autoriser le rejeu**: La tâche interrompue est relancée avec `resume: "retry-incomplete"`.
     - `start()`

```ts
import { createHash } from "node:crypto";
import {
  createLocalTransport,
  recoverWorkflowCheckpoint,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const runId = "scan-2026-09";
const digest = createHash("sha256").update(runId).digest("hex");
const saved = await transporter.read(`checkpoints/${digest}.json`);
if (saved)
  await recoverWorkflowCheckpoint({
    transporter,
    runId,
    revision: saved.revision,
  });
```

La clé du checkpoint est `checkpoints/` suivi du SHA-256 du `runId`. La progression reste intacte ; relancez l’exécution avec `resume: "retry-incomplete"`.

## Reprendre une exécution depuis un job de file

[`defineWorkflowJob()`](../job-queues/) exécute chaque job sous son `runId`. Une file renvoie le job existant pour un identifiant qu’elle connaît déjà : un job terminé ne s’exécute donc jamais à nouveau.

Pour poursuivre l’exécution, publiez un nouvel identifiant de job avec le même `runId` et la même `input` :

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
try {
  await queue.enqueue({
    id: "fix-42-resume-1",
    handler: "fix",
    input: { runId: "fix-42", input: { issue: 42 } },
  });
} finally {
  await queue.close();
}
```

Une autre `input` change la version du checkpoint et le job échoue. Pour rejouer des tâches en échec ou interrompues, le handler doit recevoir `checkpoint: { store, version, resume: "retry-incomplete" }`.

## Stocker les checkpoints à distance

Le store accepte n’importe quel `Transport`. Utilisez un transport S3 ou R2 pour que des workers sur plusieurs machines partagent les exécutions : voir [Où vivent les données](../storage/).

## Limites

- Un seul `start()` à la fois par `runId`. Un second est refusé tant que le premier s’exécute.
- La propriété n’expire jamais d’elle-même. Libérez-la avec `recoverWorkflowCheckpoint()` après avoir arrêté l’ancien runner.
- Le rejeu répète les effets de bord qu’une tâche interrompue a déjà produits. Dédupliquez-les avec `context.idempotencyKey` : voir [Files de jobs et workers](../job-queues/).

API : [createWorkflowCheckpointStore](../../reference/createworkflowcheckpointstore/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/) · [recoverWorkflowCheckpoint](../../reference/recoverworkflowcheckpoint/) · [WorkflowCheckpoint](../../reference/workflowcheckpoint/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
