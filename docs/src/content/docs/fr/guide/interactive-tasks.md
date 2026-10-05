---
title: "Permettre à l’agent de poser des questions"
description: "Suspendez une tâche pour obtenir une réponse humaine et poursuivez la conversation enregistrée."
---

## Choisir entre une question et une approbation

Utilisez une tâche interactive si l’agent a besoin d’une information humaine pour poursuivre. Utilisez une tâche d’approbation si votre workflow attend une autorisation. Ces deux pauses ont des entrées et des règles de reprise différentes.

|                    | Tâche interactive                                    | Gate d’approbation                           |
| ------------------ | ---------------------------------------------------- | -------------------------------------------- |
| Question           | Écrite par l’agent, adaptée aux réponses précédentes | Le `prompt` fixe du gate                     |
| Réponse            | Texte libre, ou l’un des `choices` de l’agent        | `approve` ou `reject`                        |
| Ce qu’elle reprend | La conversation de l’agent, dans un nouveau tour     | Les tâches qui dépendent du gate             |
| Soumise avec       | `start({ answers })`                                 | `start({ decisions })`                       |
| Preuve signée      | Non                                                  | Facultative, avec `authentication: "signed"` |
| Définition         | `defineInteractiveAgentTask()`                       | `defineApprovalTask()`, `definePauseTask()`  |

## Définir le dialogue

La tâche exige un checkpoint : il conserve les questions et les réponses d’un processus à l’autre.

<!-- tabs -->

```ts title="clarify.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";

export const clarify = defineInteractiveAgentTask({
  key: "clarify",
  repository,
  agent: coder,
  sandboxProvider,
  brief:
    'Define the application with its owner, then complete with {"summary": string, "features": string[]}.',
  actors: ["owner"],
});
```

```ts title="question-store.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="start.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { clarify } from "./clarify.ts";
import { store } from "./question-store.ts";

export const workflow = defineWorkflow("discovery", [clarify]);
export const checkpoint = { store, runId: "discovery-42", version: "1" };
export const result = await workflow.start({ checkpoint });
reportValue(result.status, result.inputRequests[0]?.question);
// Example output: waiting-input What should the new endpoint return?
```

Le script affiche `waiting-input` et la première question de l’agent. Outpost ajoute lui-même le protocole de question à votre brief : le brief décrit seulement l’objectif et la forme du JSON final.

Référence API : [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/).

Codex, Claude Code, Copilot CLI, Kimi Code et le [harness intégré](../harness/) sont acceptés. Antigravity et un harness créé avec `conversations: false` sont refusés dès la définition de la tâche : voir [Conversations](../conversations/).

## Déroulement du dialogue

<!-- canvas -->

- **Tour**: L’agent travaille dans une sandbox neuve.
  - Étapes
  - **Exécution**: Il poursuit sa conversation avec le brief ou la dernière réponse.
    - sandbox
  - **Fermeture**: Outpost enregistre la conversation et ferme la sandbox.
    - host
  - → **Question**: puis
- **Question**: L’exécution s’arrête sur `waiting-input`.
  - Étapes
  - **Enregistrement**: Le checkpoint conserve la question ; les tâches dépendantes attendent.
    - `inputRequests`
  - → **Réponse**: puis
- **Réponse**: Votre application la soumet.
  - Étapes
  - **Validation**: Outpost vérifie et enregistre la réponse, puis lance le tour suivant.
    - `start({ answers })`
  - → **Sortie**: puis
- **Sortie**: L’agent termine avec du JSON au lieu de poser une question.
  - Étapes
  - **Conservation**: Le checkpoint conserve la sortie.
    - `result.value()`

## Afficher les questions

`result.inputRequests` liste toutes les questions en attente. Plusieurs tâches interactives indépendantes peuvent attendre en même temps.

Référence API : [WorkflowInputRequest](../../reference/workflowinputrequest/).

:::caution
Prévenez les personnes à partir de `result.inputRequests`, une fois que `start()` a rendu la main. L’[événement de workflow](../progress/) `input-request` part avant l’écriture du checkpoint et ne porte que la clé de la tâche.
:::

## Accepter une réponse

Relancez le même workflow avec le même checkpoint et une entrée `answers` par demande.

<!-- tabs -->

```ts title="answer-value.ts"
import type { WorkflowInputRequest } from "@elie-laloum/outpost";

export function answerValue(
  request: WorkflowInputRequest,
  actor: string,
  value: string,
) {
  return {
    executionId: request.executionId,
    key: request.key,
    requestId: request.id,
    actor,
    value,
  };
}
```

```ts title="answer.ts"
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowInputRequest,
} from "@elie-laloum/outpost";
import { answerValue } from "./answer-value.ts";

export async function answer(
  workflow: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  request: WorkflowInputRequest,
  actor: string,
  value: string,
) {
  return workflow.start({
    checkpoint,
    answers: [answerValue(request, actor, value)],
  });
}
```

`start()` exécute le tour suivant et rend la main à la question suivante ou à la fin de la tâche. Sans `answers`, il renvoie les questions en attente sans appeler le modèle.

Outpost vérifie toutes les réponses avant d’en appliquer une seule. Il refuse un `requestId` périmé, un acteur absent de `actors`, une autre exécution, une deuxième réponse pour la même tâche et, quand `allowFreeText` vaut `false`, une valeur hors de `choices`.

:::caution
La soumission n’est pas idempotente. Après une réponse HTTP perdue, appelez `start({ checkpoint })` pour lire la demande actuelle avant de renvoyer. Les acteurs sont des métadonnées de confiance : authentifiez d’abord la personne, comme pour les [approbations](../approvals/).
:::

## Lire le résultat

Lisez le résultat du dialogue avec `result.value(clarify)`.

Référence API : [InteractiveAgentResult](../../reference/interactiveagentresult/).

`result.usage` cumule les tentatives et les tokens de tous les tours, réparations comprises. `unwrap()` lève une erreur tant que l’exécution attend. Dans un workflow qui contient aussi des étapes d’approbation, `waiting-input` l’emporte sur `paused`, et un échec ou une annulation l’emporte sur les deux.

## Conserver le workspace

Chaque tour ouvre une sandbox et la ferme avant la publication de la question. Les fichiers du worktree passent d’un tour à l’autre, commités ou non ; le répertoire personnel de la sandbox et les processus en cours, non.

Outpost n’intègre, ne pousse ni ne supprime jamais le worktree. Relisez `branch` et fusionnez-la vous-même ([Dépôt et branche](../repository-and-branch/)), puis nettoyez-la avec [Rétention et nettoyage](../retention/).

Le dépôt, le worktree et le stockage des conversations doivent rester aux mêmes chemins pour le processus suivant. Un worktree déplacé échoue avec `Interactive workspace moved; recover it explicitly`, et une branche changée avec `Interactive workspace branch changed; recover it explicitly`.

## Reprendre après un arrêt brutal

Un arrêt brutal pendant un tour laisse la tâche inachevée, et le `start()` suivant refuse de la rejouer. Autorisez le rejeu avec `checkpoint: { ...checkpoint, resume: "retry-incomplete" }`.

Le tour repart de la dernière conversation et de la dernière réponse enregistrées ; une sortie déjà terminée est réutilisée sans appeler le modèle. Les effets partiels du tour interrompu peuvent se répéter. [Exécutions durables](../durable-runs/) décrit le rejeu et la récupération de la propriété du checkpoint.

## Écrire une tâche interactive personnalisée

`defineTask()` avec `interaction` suspend n’importe quelle tâche sur une question. `defineInteractiveAgentTask()` repose sur ce mécanisme.

```ts
import { defineTask } from "@elie-laloum/outpost";

const region = defineTask({
  key: "region",
  interaction: { identity: "region-v1", actors: ["owner"] },
  perform: (context) => {
    const interaction = context.interaction;
    if (!interaction) throw new Error("Run with a checkpoint");
    const answer = interaction.answer;
    if (!answer)
      return interaction.suspend(
        { question: "Deploy to which region?", choices: ["eu", "us"] },
        { step: "region" },
      );
    return { region: answer.value };
  },
});
```

`perform` repart du début après chaque réponse. Lisez `interaction.state` pour sauter le travail déjà fait, et `save(state)` pour enregistrer l’avancement ; les deux ne contiennent que du JSON.

## Limites

- Une question au dernier des `maxTurns` fait échouer la tâche au lieu d’attendre.
- Les questions n’expirent pas et les réponses ne sont pas signées.
- Une annulation arrête le tour en cours ; une question déjà enregistrée reste en attente.
- Changer l’agent, le modèle, le brief, le dépôt, le fournisseur, les acteurs ou `maxTurns` rend le checkpoint enregistré incompatible : démarrez un nouveau `runId`.

Un scénario complet, avec une approbation, des tests rouges et du code relu : [Construire un workflow de développement](../development-workflow/).

API : [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) · [InteractiveAgentResult](../../reference/interactiveagentresult/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/) · [TaskInteractionContext](../../reference/taskinteractioncontext/)
