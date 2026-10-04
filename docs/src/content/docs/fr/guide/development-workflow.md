---
title: "Construire un workflow de développement"
description: "D’un ticket à une branche relue : un agent interroge son responsable et planifie, le responsable approuve le plan, puis des agents écrivent d’abord des tests qui échouent, puis du code jusqu’à ce que les tests passent et qu’un relecteur l’accepte. Votre code vérifie chaque étape et fait chaque commit."
---

Un ticket demande « ajouter un export CSV à la liste des commandes ». Un agent demande à son responsable ce que le ticket laisse ouvert et rend un plan ; le responsable l’approuve. Des agents écrivent ensuite les tests, qui doivent échouer, puis le code, qui doit les faire passer et convaincre un agent relecteur. Le travail arrive sur `outpost/shop-142` : un commit pour les tests, un pour le code.

Le workflow suit une règle de [redline](https://github.com/elie-laloum/redline), un système qui mène un ticket jusqu’à une merge request, construit sur Outpost : **le code décide, les agents jugent**. Les agents répondent et modifient des fichiers ; votre code valide leurs réponses, lance les tests, refuse les modifications hors des fichiers de chaque rôle et fait les commits.

## Ce que vous utilisez

<!-- features -->

- [Tâches interactives](../interactive-tasks/): L’agent interroge le responsable, un point à la fois, puis rend le plan.
  - `defineInteractiveAgentTask()`
- [Approbations](../approvals/): Le responsable approuve le plan avant toute modification de fichier.
  - `defineApprovalTask()`
- [Boucles de vérification](../verification-loops/): Écrire, vérifier, renvoyer le refus, dans un nombre de tours limité.
  - `defineLoopTask()`
  - `defineAgentTask()`
- [Réponses typées](../typed-responses/): Le relecteur rend un verdict validé.
  - `defineJsonResponse()`
- [Sessions de sandbox](../sandbox-sessions/): Une sandbox chaude garde les dépendances entre les agents et les lancements de tests.
  - `createSandbox()`
  - `sandbox.command()`
- [Exécutions durables](../durable-runs/): Un checkpoint garde les réponses, le plan et les boucles terminées d’un processus à l’autre.
  - `createWorkflowCheckpointStore()`

## Le code

Trois fichiers se placent à côté du `outpost.config.mts` d’[Installation](../setup/) : le cadrage avec le responsable, la livraison dans la sandbox, et les fonctions qu’appelle votre application.

<!-- tabs -->

```ts title="framing.ts"
import {
  defineApprovalTask,
  defineInteractiveAgentTask,
  defineTask,
} from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};

const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});

export const frame = defineInteractiveAgentTask({
  key: "frame",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Read the code first. Then ask the owner about what the ticket leaves open, one point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "tests": string[], "code": string[]}:',
    "the behaviors to test, then the changes to make.",
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});

// Les règles du plan : le code vérifie le JSON de l’agent avant toute lecture.
export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

```ts title="delivery.ts"
import {
  createSandbox,
  defineAgentTask,
  defineJsonResponse,
  defineLoopTask,
} from "@elie-laloum/outpost";
import type { LoopTaskContext, Sandbox } from "@elie-laloum/outpost";
import { z } from "zod";
import { plan, review, ticket } from "./framing.ts";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

export const branch = `outpost/${ticket.key.toLowerCase()}`;
const isTest = (file: string) => /(^|\/)test\/|\.test\.[cm]?[jt]s$/.test(file);
let opened: Sandbox | undefined;

// N’ouvre la sandbox qu’à la première tâche de livraison : les questions n’attendent pas npm ci.
async function workbench() {
  opened ??= await createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: branch },
    hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  });
  return opened;
}

export async function closeWorkbench() {
  await opened?.close();
  opened = undefined;
}

async function run(
  context: LoopTaskContext,
  executable: string,
  ...args: string[]
) {
  return (await workbench()).command({
    executable,
    arguments: args,
    retain: 20_000,
    signal: context.signal,
  });
}

async function changedFiles(context: LoopTaskContext) {
  const status = await run(context, "git", "status", "--porcelain", "-uall");
  return status.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}

async function commit(context: LoopTaskContext, message: string) {
  await run(context, "git", "add", "--all");
  const result = await run(context, "git", "commit", "--message", message);
  if (result.status !== 0) throw new Error(result.stderr);
}

async function ask(context: LoopTaskContext, key: string, lines: string[]) {
  const role = defineAgentTask({
    key,
    sandbox: await workbench(),
    request: () => ({ brief: { text: lines.join("\n") } }),
  });
  return (await role.perform(context)).text;
}

const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});

export const tests = defineLoopTask({
  key: "tests",
  after: [review],
  maxRounds: 4,
  async attempt(context, feedback) {
    const summary = await ask(context, "test-writer", [
      `Ticket ${ticket.key}: ${ticket.text}`,
      "Write tests for these behaviors. Edit test files only and do not commit.",
      ...context.value(plan).tests.map((item) => `- ${item}`),
      feedback ? `Your last attempt was rejected:\n${feedback}` : "",
    ]);
    return { summary };
  },
  async check(context) {
    const files = await changedFiles(context);
    const outside = files.filter((file) => !isTest(file));
    if (!files.length) return { done: false, feedback: "No test changed." };
    if (outside.length)
      return { done: false, feedback: `Revert:\n${outside.join("\n")}` };
    const result = await run(context, "npm", "test");
    if (result.status === 0)
      return { done: false, feedback: "The tests already pass." };
    await commit(context, `test(${ticket.key}): ${ticket.text}`);
    return { done: true };
  },
});

export const code = defineLoopTask({
  key: "code",
  after: [tests],
  maxRounds: 6,
  async attempt(context, feedback) {
    const summary = await ask(context, "developer", [
      `Ticket ${ticket.key}: ${ticket.text}`,
      "Make the failing tests pass. Do not edit tests and do not commit.",
      ...context.value(plan).code.map((item) => `- ${item}`),
      feedback ? `Your last attempt was rejected:\n${feedback}` : "",
    ]);
    return { summary };
  },
  async check(context) {
    const edited = (await changedFiles(context)).filter(isTest);
    if (edited.length)
      return { done: false, feedback: `Revert:\n${edited.join("\n")}` };
    const result = await run(context, "npm", "test");
    if (result.status !== 0)
      return { done: false, feedback: `${result.stdout}\n${result.stderr}` };
    const reviewing = defineAgentTask({
      key: "reviewer",
      sandbox: await workbench(),
      request: () => ({
        response: verdict,
        brief: {
          text: [
            `Review the uncommitted changes for ${ticket.key} against this plan:`,
            ...context.value(plan).code.map((item) => `- ${item}`),
            'End with <review>{"approved": false, "feedback": "What to change"}</review>.',
          ].join("\n"),
        },
      }),
    });
    const { value } = await reviewing.perform(context);
    if (!value.approved) return { done: false, feedback: value.feedback };
    await commit(context, `feat(${ticket.key}): ${ticket.text}`);
    return { done: true };
  },
});
```

```ts title="run.ts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { WorkflowResult } from "@elie-laloum/outpost";
import { branch, closeWorkbench, code, tests } from "./delivery.ts";
import { frame, plan, review, ticket } from "./framing.ts";
import { repository } from "./outpost.config.mts";

const workflow = defineWorkflow("develop", [frame, plan, review, tests, code]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};

async function start(options: Parameters<typeof workflow.start>[0] = {}) {
  try {
    return view(await workflow.start({ ...options, checkpoint }));
  } finally {
    await closeWorkbench();
  }
}

function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(code).summary };
}

// Démarre l’exécution, ou indique ce qu’elle attend.
export const progress = () => start();

// `actor` vient de votre session authentifiée, jamais du formulaire.
export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return start({ answers: [{ executionId, key, requestId, actor, value }] });
}

export async function decide(
  actor: string,
  action: "approve" | "reject",
  reason: string,
) {
  const current = await workflow.start({ checkpoint });
  const pending = current.tasks.find((task) => task.key === "review")?.pause;
  if (!pending) throw new Error("No plan awaits review");
  const { executionId } = current;
  const requestId = pending.id;
  const decision = { executionId, key: "review", requestId, actor, reason };
  return start({ decisions: [{ ...decision, action }] });
}
```

Votre application affiche `questions` dans un formulaire et `plan` sur une page de relecture. Chaque appel reconstruit le même workflow et le même checkpoint : il peut s’exécuter dans n’importe quel processus de la machine qui héberge le dépôt.

## Comment ça marche

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre code](../durable-runs/): `progress()`, `answer()` et `decide()` reprennent l’exécution depuis son checkpoint.
  - hôte
  - → **Cadrage**: `workflow.start()`
- [Workflow](../typed-workflows/): Cinq tâches ; chacune démarre quand la précédente réussit.
  - workflow
  - **Cadrage**: `defineInteractiveAgentTask()`, une sandbox par tour
    - → **Responsable**: une question à la fois
  - **Plan**: `planSchema` refuse un plan mal formé
  - **Relecture**: `defineApprovalTask()`, la seule porte
    - → **Responsable**: plan
  - **Tests**: `defineLoopTask()`, 4 tours au plus
    - → **Rédacteur de tests**: tests à écrire
  - **Code**: `defineLoopTask()`, 6 tours au plus
    - → **Développeur**: code à écrire
    - → **Relecteur**: changements au vert
  - → **Checkpoint**: réponses, plan, tours
- [Responsable](../approvals/): Répond via votre application et décide du plan.
  - CLI · HTTP
  - → **Cadrage**: réponse
  - → **Relecture**: approuver ou refuser
- [Sandbox](../sandbox-sessions/): Une sandbox chaude sur `outpost/shop-142`, ouverte au premier tour de `tests`.
  - sandbox
  - **Rédacteur de tests**: ne modifie que des fichiers de test
  - **Développeur**: ne modifie jamais un test
  - **Relecteur**: rend `{ approved, feedback }`
  - → **Branche**: commits faits par votre code
- **Branche**: `outpost/shop-142` dans `.outpost/workspaces`, conservée pour relecture ; rien n’est fusionné ni poussé.
  - hôte
- [Checkpoint](../durable-runs/): `.outpost/storage` : tout processus de la machine peut reprendre l’exécution.
  - hôte

Les vérifications s’enchaînent dans un ordre fixe, et le premier refus devient le retour du tour suivant :

| Boucle  | Vérification, dans l’ordre              | Refuse quand                                        |
| ------- | --------------------------------------- | --------------------------------------------------- |
| `tests` | Zone d’écriture                         | Aucun test modifié, ou un fichier hors test modifié |
| `tests` | Lancement rouge : `npm test`            | Les tests passent déjà : ils ne prouvent rien       |
| `code`  | Zone d’écriture                         | Un fichier de test modifié                          |
| `code`  | Lancement vert : `npm test`             | Les tests échouent ; leur sortie devient le retour  |
| `code`  | Agent relecteur, `defineJsonResponse()` | `approved` vaut `false`                             |

Les agents ne commitent jamais. Chaque boucle ne commite qu’une fois toutes ses vérifications acceptées : un tour refusé laisse ses changements à corriger par la tentative suivante. `answer()` et `decide()` rendent la main après les tours d’agent suivants, qui peuvent durer plusieurs minutes : depuis une requête web, confiez-les à un [worker de file de jobs](../job-queues/).

:::caution
La zone d’écriture et les tests sont vérifiés par votre code, mais « ne commite pas » et « ne modifie que des fichiers de test » sont des instructions. Un agent peut tout de même lancer `git commit` lui-même : relisez la branche avant de la fusionner.
:::

## L’adapter

| Variante                    | Changement                                                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lire le ticket              | Ajoutez une première `defineTask()` qui récupère le ticket dans votre outil de suivi et rend `{ key, text }` ; lisez-le avec `context.value()` dans les briefs à la place de la constante.   |
| Un relecteur adverse        | Passez un autre agent dans la requête du relecteur, par exemple Claude Code avec `createClaudeHarness()` : un autre modèle manque d’autres choses ([Choisir un agent](../choose-an-agent/)). |
| Vérifications plus strictes | Ajoutez une vérification de types et un lint au lancement vert, ou un second relecteur qui vérifie que les tests échouent pour la bonne raison, comme le fait redline.                       |
| Ouvrir une merge request    | Quand `progress()` rend `branch`, poussez-la depuis l’hôte et ouvrez une pull request brouillon avec `gh pr create --draft --head`, ou une merge request avec `glab mr create --draft`.      |
| Plusieurs dépôts            | Une paire de boucles par dépôt, enchaînées avec `after` dans l’ordre des dépendances ([Modifier plusieurs dépôts](../multi-repository-change/)).                                             |

## Limites

- **Un refus termine l’exécution**: Un plan refusé saute la livraison et l’exécution se termine en `failed`. Démarrez un nouveau `runId` avec la remarque du responsable dans le brief.
- **Plan mal formé**: `plan` lève une erreur, et l’exécution échoue sans redemander à l’agent. Utilisez une [tâche en boucle](../verification-loops/) pour laisser l’agent corriger son propre JSON.
- **Tours épuisés**: Une boucle dont la dernière vérification refuse échoue avec `LoopTaskExhausted` ; les tâches terminées restent dans le checkpoint et la branche garde les tests commités.
- **Même machine**: Le dépôt, ses worktrees et la conversation du cadrage doivent être accessibles au processus qui répond.
- **Tour interrompu**: Après un plantage juste après un commit, la vérification reprise ne trouve aucun changement et consomme un tour. Inspectez la branche avant de reprendre.
- **Travail conservé**: Le cadrage garde son worktree sur une branche `outpost/interactive-…` ; [nettoyez-le](../retention/) une fois terminé.

API : [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [createSandbox](../../reference/createsandbox/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).
