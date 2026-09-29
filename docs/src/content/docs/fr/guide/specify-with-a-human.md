---
title: "Rédiger une spécification avec un humain"
description: "Un agent interroge le responsable d’une fonctionnalité, une question à la fois, rend une spécification JSON et la code sur une branche une fois approuvée."
---

La demande est floue : « ajouter un export CSV ». L’agent pose à son responsable les questions dont il a besoin, une à la fois, et consigne les réponses dans une spécification JSON. Le responsable l’approuve, puis une seconde tâche l’implémente sur `outpost/csv-export`.

## Ce que vous utilisez

<!-- features -->

- [Tâches interactives](../interactive-tasks/): L’agent pose une question, attend la réponse, puis reprend sa conversation.
  - `defineInteractiveAgentTask()`
- [Approbations](../approvals/): Le responsable approuve la spécification avant que le code soit écrit.
  - `defineApprovalTask()`
- [Exécutions persistantes](../durable-runs/): Un checkpoint conserve questions et réponses d’un processus à l’autre.
  - `createWorkflowCheckpointStore()`
- [Tâches et dépendances](../task-dependencies/): L’implémentation démarre après l’approbation et lit la spécification.
  - `after`
  - `context.value()`
- [Dépôt et branche](../repository-and-branch/): Le code arrive sur une branche nommée, prête à relire.
  - `named`
- [Rédiger le brief](../briefs/): La spécification devient le brief de l’implémentation.

## Le code

Un seul fichier contient le workflow et les trois fonctions qu’appelle votre application. Il se place à côté du `outpost.config.mts` d’[Installation](../setup/).

```ts title="specify.mts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineInteractiveAgentTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { WorkflowResult } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const specify = defineInteractiveAgentTask({
  key: "specify",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    "Specify a CSV export of the orders list with its owner.",
    "Read the code first, then ask about one open point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "requirements": string[], "acceptance": string[]}.',
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});

const approval = defineApprovalTask({
  key: "approve",
  after: [specify],
  prompt: "Implement this specification?",
  actors: ["owner"],
});

const coding = defineIsolatedTask({
  key: "coding",
  request: (context) => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/csv-export" },
    brief: {
      text: `Implement this specification, test it and commit:\n${JSON.stringify(context.value(specify).output)}`,
    },
  }),
});

const implement = defineTask({
  key: "implement",
  after: [specify, approval],
  perform: async (context) => {
    const { branch, commits } = await coding.perform(context);
    return { branch, commits: commits.length };
  },
});

const workflow = defineWorkflow("csv-export", [specify, approval, implement]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: "csv-export",
  version: "1",
};

function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused")
    return { specification: result.value(specify).output };
  result.unwrap();
  return { implemented: result.value(implement) };
}

// Démarre l’exécution, ou indique ce qu’elle attend.
export async function progress() {
  return view(await workflow.start({ checkpoint }));
}

// `actor` vient de votre session authentifiée, jamais du formulaire.
export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return view(
    await workflow.start({
      checkpoint,
      answers: [{ executionId, key, requestId, actor, value }],
    }),
  );
}

export async function approve(actor: string, reason: string) {
  const current = await workflow.start({ checkpoint });
  const pending = current.tasks.find((task) => task.key === "approve")?.pause;
  if (!pending) throw new Error("No specification awaits approval");
  const decision = {
    executionId: current.executionId,
    key: "approve",
    requestId: pending.id,
    actor,
    reason,
    action: "approve" as const,
  };
  return view(await workflow.start({ checkpoint, decisions: [decision] }));
}
```

Votre application affiche `questions` dans un formulaire (`question`, et `choices` quand l’agent en propose) et `specification` sur une page de relecture. Chaque appel reconstruit le même workflow et le même checkpoint : il peut donc s’exécuter dans n’importe quel processus de la machine qui héberge le dépôt.

## Comment ça marche

<!-- flow -->

1. **Question**: `progress()` démarre l’exécution.
   - **Premier tour**: L’agent lit le code dans une sandbox et rend sa première question.
     - sandbox
   - **Attente**: La sandbox se ferme, la question est enregistrée et l’exécution rend `waiting-input`.
     - `inputRequests`
2. **Réponse**: Votre formulaire appelle `answer()`, une fois par question.
   - **Vérification**: L’identifiant de la demande, l’exécution et l’acteur sont validés avant tout lancement.
     - `WorkflowAnswer`
   - **Tour suivant**: Une nouvelle sandbox reprend la conversation avec la réponse ; l’agent repose une question ou termine.
     - sandbox
3. **Approbation**: L’agent rend sa spécification JSON.
   - **Pause**: La porte `approve` arrête l’exécution ; `progress()` rend la spécification.
     - `paused`
   - **Décision**: `approve()` enregistre la décision du responsable.
     - `defineApprovalTask()`
4. **Implémentation**: L’exécution approuvée continue dans le même appel.
   - **Code**: Un second agent implémente la spécification sur `outpost/csv-export`.
     - `defineIsolatedTask()`
   - **JSON conservé**: `implement` enregistre la branche et le nombre de commits, car un checkpoint ne contient que du JSON.
     - `defineTask()`

`answer()` et `approve()` rendent la main après le tour d’agent suivant, qui peut durer plusieurs minutes. Depuis une requête web, confiez-les à un [worker de file de jobs](../job-queues/) plutôt que d’attendre.

:::caution
Outpost vérifie que `actor` figure dans `actors` ; il ne sait pas qui a rempli le formulaire. Authentifiez l’utilisateur avant de transmettre son nom d’acteur.
:::

## L’adapter

### Proposer des choix plutôt que du texte libre

Demandez des choix dans le brief. Avec `"allowFreeText": false`, une réponse doit correspondre exactement à l’un des `request.choices` : affichez-les sous forme de boutons.

```ts
const brief = [
  "Specify a CSV export of the orders list with its owner.",
  'When the options are known, ask with "choices" and "allowFreeText": false.',
].join("\n");
```

### Utiliser un autre agent

Le dialogue exige un agent qui capture et reprend sa conversation : Codex, Claude Code, Copilot CLI, Kimi Code ou le [harness intégré](../harness/). Passez-le comme `agent` de `specify` ; `coding` peut garder `coder`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const interviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

### Prévenir le responsable d’une question en attente

Envoyez chaque question dès que `progress()` ou `answer()` la rend : la demande est déjà enregistrée, et son `id` désigne le formulaire à ouvrir.

```ts
import type { WorkflowInputRequest } from "@elie-laloum/outpost";

async function notifyOwner(
  questions: readonly WorkflowInputRequest[],
  send: (text: string) => Promise<void>,
) {
  for (const { id, question } of questions)
    await send(`${question}\nAnswer: https://example.com/specs/${id}`);
}
```

## Limites

- **Un appel à la fois**: Un second `start()` sur la même exécution échoue tant qu’un autre est actif. Après un plantage, [récupérez la propriété](../durable-runs/).
- **Même machine**: Le dépôt, le worktree du dialogue et sa conversation doivent être accessibles au processus qui répond.
- **Tours**: `maxTurns` compte la spécification finale ; une question au dernier tour fait échouer la tâche.
- **Nouvel envoi**: Une réponse déjà acceptée est rejetée comme périmée. Après une réponse HTTP perdue, appelez `progress()` avant de renvoyer.
- **Travail conservé**: Aucune des deux branches n’est fusionnée. Le dialogue garde son worktree sur une branche `outpost/interactive-…` ; [nettoyez-le](../retention/) une fois terminé.
- **Antigravity**: Il ne peut pas reprendre une conversation dans une nouvelle sandbox : `defineInteractiveAgentTask()` le refuse.

API : [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineIsolatedTask](../../reference/defineisolatedtask/).
