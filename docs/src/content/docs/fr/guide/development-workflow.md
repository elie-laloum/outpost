---
title: "Créer un workflow de développement"
description: "Passez d’un ticket aux questions, au plan validé, puis aux tests et au code vérifié."
---

Cet exemple part d’un ticket demandant un export CSV et suit un workflow de développement complet. Un agent pose les questions nécessaires au responsable du ticket, puis propose un plan. Après validation, les agents écrivent des tests en échec, réalisent la modification et la font relire. Le travail accepté est enregistré sur `outpost/shop-142`, avec un commit pour les tests et un autre pour le code.

Le workflow suit une règle de [redline](https://github.com/elie-laloum/redline), un système qui mène un ticket jusqu’à une merge request, construit sur Outpost : **le code décide, les agents jugent**. Les agents répondent et modifient des fichiers ; votre code valide leurs réponses, lance les tests, refuse les modifications hors des fichiers de chaque rôle et fait les commits.

## Ce que montre l’exemple

<!-- features -->

- [Tâches interactives](../interactive-tasks/): L’agent interroge le responsable, un point à la fois, puis rend le plan.
- [Approbations](../approvals/): Le responsable approuve le plan avant toute modification de fichier.
- [Boucles de vérification](../verification-loops/): Écrire, vérifier, renvoyer le refus, dans un nombre de tours limité.
- [Réponses typées](../typed-responses/): Le relecteur rend un verdict validé.
- [Sessions de sandbox](../sandbox-sessions/): Une sandbox chaude garde les dépendances entre les agents et les lancements de tests.
- [Exécutions durables](../durable-runs/): Un checkpoint garde les réponses, le plan et les boucles terminées d’un processus à l’autre.

## Écrire le script

Enregistrez les fichiers présentés dans les onglets à côté du `outpost.config.ts` de la page [Installation](../setup/). Ils sont regroupés par rôle : clarifier le ticket, préparer la sandbox, écrire les tests, réaliser la modification et fournir les fonctions qu’appelle votre application. Chaque fichier a une responsabilité ; les imports les relient.

### Clarifier le ticket et approuver le plan

Commencez par le ticket, le format du plan attendu et l’étape d’approbation.

<!-- tabs -->

```ts title="ticket.ts"
import { z } from "zod";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};
export const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});
```

```ts title="frame.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

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
```

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { planSchema } from "./ticket.ts";

export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { ticket } from "./ticket.ts";

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

```ts title="loop.types.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";

export type LoopCheck = (context: LoopTaskContext) => Promise<LoopCheckResult>;
export type LoopAttempt = (
  context: LoopTaskContext,
  feedback: string | undefined,
) => Promise<{ summary: string }>;
```

### Préparer et réutiliser la sandbox

Ces fonctions ouvrent une sandbox au début de la réalisation et la réutilisent pour les commandes et les agents.

<!-- tabs -->

```ts title="branch.ts"
import { ticket } from "./ticket.ts";

export const branch = `outpost/${ticket.key.toLowerCase()}`;
export const isTest = (file: string) =>
  /(^|\/)test\/|\.test\.[cm]?[jt]s$/.test(file);
```

```ts title="workbench.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./branch.ts";

export let opened: Sandbox | undefined;
export async function workbench() {
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
```

```ts title="commands.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function run(
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
```

```ts title="git.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { run } from "./commands.ts";

export async function changedFiles(context: LoopTaskContext) {
  const status = await run(context, "git", "status", "--porcelain", "-uall");
  return status.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}
export async function commit(context: LoopTaskContext, message: string) {
  await run(context, "git", "add", "--all");
  const result = await run(context, "git", "commit", "--message", message);
  if (result.status !== 0) throw new Error(result.stderr);
}
```

```ts title="ask.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function ask(
  context: LoopTaskContext,
  key: string,
  lines: string[],
) {
  const role = defineAgentTask({
    key,
    sandbox: await workbench(),
    request: () => ({ brief: { text: lines.join("\n") } }),
  });
  return (await role.perform(context)).text;
}
```

### Écrire et vérifier les tests

La boucle de tests refuse les modifications hors des fichiers de test et exige un échec avant de créer le commit.

<!-- tabs -->

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

export const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
```

```ts title="write-zones.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { changedFiles } from "./git.ts";
import { isTest } from "./branch.ts";

export async function checkTestFiles(context: LoopTaskContext) {
  const files = await changedFiles(context);
  const outside = files.filter((file) => !isTest(file));
  if (!files.length) return "No test changed.";
  if (outside.length) return `Revert:\n${outside.join("\n")}`;
}
export async function checkCodeFiles(context: LoopTaskContext) {
  const edited = (await changedFiles(context)).filter(isTest);
  if (edited.length) return `Revert:\n${edited.join("\n")}`;
}
```

```ts title="test-attempt.ts"
import type { LoopAttempt } from "./loop.types.ts";
import { ask } from "./ask.ts";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export const testAttempt: LoopAttempt = async (context, feedback) => {
  const summary = await ask(context, "test-writer", [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Write tests for these behaviors. Edit test files only and do not commit.",
    ...context.value(plan).tests.map((item) => `- ${item}`),
    feedback ? `Your last attempt was rejected:\n${feedback}` : "",
  ]);
  return { summary };
};
```

```ts title="test-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { checkTestFiles } from "./write-zones.ts";
import { run } from "./commands.ts";
import { commit } from "./git.ts";
import { ticket } from "./ticket.ts";

export const testCheck: LoopCheck = async (context) => {
  const rejection = await checkTestFiles(context);
  if (rejection) return { done: false, feedback: rejection };
  const result = await run(context, "npm", "test");
  if (result.status === 0)
    return { done: false, feedback: "The tests already pass." };
  await commit(context, `test(${ticket.key}): ${ticket.text}`);
  return { done: true };
};
```

```ts title="tests.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { review } from "./approval.ts";
import { testAttempt } from "./test-attempt.ts";
import { testCheck } from "./test-check.ts";

export const tests = defineLoopTask({
  key: "tests",
  after: [review],
  maxRounds: 4,
  attempt: testAttempt,
  check: testCheck,
});
```

### Réaliser et relire la modification

La boucle d’implémentation vérifie les fichiers modifiés, exécute les tests et demande une revue avant de créer le commit.

<!-- tabs -->

```ts title="code-attempt.ts"
import type { LoopAttempt } from "./loop.types.ts";
import { ask } from "./ask.ts";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export const codeAttempt: LoopAttempt = async (context, feedback) => {
  const summary = await ask(context, "developer", [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Make the failing tests pass. Do not edit tests and do not commit.",
    ...context.value(plan).code.map((item) => `- ${item}`),
    feedback ? `Your last attempt was rejected:\n${feedback}` : "",
  ]);
  return { summary };
};
```

```ts title="green-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { run } from "./commands.ts";

export const greenCheck: LoopCheck = async (context) => {
  const result = await run(context, "npm", "test");
  const feedback = `${result.stdout}\n${result.stderr}`;
  return result.status === 0 ? { done: true } : { done: false, feedback };
};
```

```ts title="review-brief.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export function reviewBrief(context: LoopTaskContext) {
  return {
    text: [
      `Review the uncommitted changes for ${ticket.key} against this plan:`,
      ...context.value(plan).code.map((item) => `- ${item}`),
      'End with <review>{"approved": false, "feedback": "What to change"}</review>.',
    ].join("\n"),
  };
}
```

```ts title="review-changes.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";
import { verdict } from "./verdict.ts";
import { reviewBrief } from "./review-brief.ts";

export async function reviewChanges(context: LoopTaskContext) {
  const reviewing = defineAgentTask({
    key: "reviewer",
    sandbox: await workbench(),
    request: () => ({ response: verdict, brief: reviewBrief(context) }),
  });
  return (await reviewing.perform(context)).value;
}
```

```ts title="code-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { checkCodeFiles } from "./write-zones.ts";
import { greenCheck } from "./green-check.ts";
import { reviewChanges } from "./review-changes.ts";
import { commit } from "./git.ts";
import { ticket } from "./ticket.ts";

export const codeCheck: LoopCheck = async (context) => {
  const edited = await checkCodeFiles(context);
  if (edited) return { done: false, feedback: edited };
  const green = await greenCheck(context);
  if (!green.done) return green;
  const value = await reviewChanges(context);
  if (!value.approved) return { done: false, feedback: value.feedback };
  await commit(context, `feat(${ticket.key}): ${ticket.text}`);
  return { done: true };
};
```

### Assembler le workflow et son checkpoint

Assemblez les tâches et le checkpoint, puis fermez la sandbox à la fin de chaque appel.

<!-- tabs -->

```ts title="code.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { tests } from "./tests.ts";
import { codeAttempt } from "./code-attempt.ts";
import { codeCheck } from "./code-check.ts";

export const code = defineLoopTask({
  key: "code",
  after: [tests],
  maxRounds: 6,
  attempt: codeAttempt,
  check: codeCheck,
});
```

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";
import { tests } from "./tests.ts";
import { code } from "./code.ts";

export const workflow = defineWorkflow("develop", [
  frame,
  plan,
  review,
  tests,
  code,
]);
```

```ts title="checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};
```

```ts title="view.ts"
import type { WorkflowResult } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { branch } from "./branch.ts";
import { code } from "./code.ts";

export function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(code).summary };
}
```

```ts title="start.ts"
import { workflow } from "./workflow.ts";
import { view } from "./view.ts";
import { checkpoint } from "./checkpoint.ts";
import { closeWorkbench } from "./workbench.ts";

export async function start(
  options: Parameters<typeof workflow.start>[0] = {},
) {
  try {
    return view(await workflow.start({ ...options, checkpoint }));
  } finally {
    await closeWorkbench();
  }
}
export const progress = () => start();
```

### Envoyer les réponses et les décisions

Votre application importe les fonctions de `run.ts` pour transmettre les réponses et les décisions.

<!-- tabs -->

```ts title="answer.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return start({ answers: [{ executionId, key, requestId, actor, value }] });
}
```

```ts title="decide.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

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

```ts title="run.ts"
import { progress } from "./start.ts";
import { answer } from "./answer.ts";
import { decide } from "./decide.ts";

export { progress } from "./start.ts";
export { answer } from "./answer.ts";
export { decide } from "./decide.ts";
```

Votre application affiche `questions` dans un formulaire et `plan` sur une page de relecture. Chaque appel reconstruit le même workflow et le même checkpoint : il peut s’exécuter dans n’importe quel processus de la machine qui héberge le dépôt.

## Comprendre les étapes

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

## Adapter l’exemple

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
