---
title: "Préparer les tests d’une modification"
description: "Préparez les tests d’un plan approuvé et conservez-les sur une branche avant l’implémentation."
---

Préparez les tests d’un plan approuvé et conservez-les sur une branche avant l’implémentation. Reprenez `ticket.ts`, `frame.ts`, `plan.ts`, `approval.ts` et `checkpoint.ts` depuis [la préparation du plan](../plan-a-change/), la [configuration de départ](../setup/) et `zod`. Votre dépôt doit avoir une commande `npm test` fonctionnelle et un fichier de verrouillage pour `npm ci`.

<!-- example:include plan-a-change ticket.ts frame.ts plan.ts approval.ts checkpoint.ts -->

[Télécharger tous les fichiers](../../../guide-examples/fr/prepare-change-tests.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

Cette leçon reprend les fichiers de la précédente, pas son exécution enregistrée. Elle définit un autre graphe et doit démarrer avec son propre `runId` : le plan sera demandé de nouveau. Pour un seul parcours du ticket à la réalisation, utilisez directement le projet [Workflow de développement](../development-workflow/).

## Préparer et réutiliser la sandbox

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
  const status = await run(
    context,
    "git",
    "status",
    "--porcelain=v1",
    "-z",
    "--no-renames",
    "-uall",
  );
  if (status.status !== 0) throw new Error(status.stderr);
  if (
    Buffer.byteLength(status.stdout) >= 20_000 ||
    (status.stdout && !status.stdout.endsWith("\0"))
  ) {
    throw new Error("Incomplete Git status output");
  }
  return status.stdout
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(3));
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

Ces types partagés relient les tentatives aux vérifications de chaque boucle.

```ts title="loop.types.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";

export type LoopCheck = (context: LoopTaskContext) => Promise<LoopCheckResult>;
export type LoopAttempt = (
  context: LoopTaskContext,
  feedback: string | undefined,
) => Promise<{ summary: string }>;
```

## Écrire et vérifier les tests

La boucle de tests refuse les modifications hors des fichiers de test et exige un échec avant de créer le commit.

<!-- tabs -->

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

## Démarrer le workflow de tests

Enregistrez ces fichiers à côté des fonctions précédentes. Utilisez une nouvelle clé de ticket : ce graphe de quatre tâches a sa propre identité de checkpoint.

<!-- tabs -->

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";
import { tests } from "./tests.ts";

export const workflow = defineWorkflow("prepare-tests", [
  frame,
  plan,
  review,
  tests,
]);
```

```ts title="view.ts"
import type { WorkflowResult } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { branch } from "./branch.ts";
import { tests } from "./tests.ts";

export function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(tests).summary };
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

## Répondre et approuver

Votre application appelle `answer("owner", requestId, texte)` pour une question en attente, puis `decide("owner", "approve", motif)` après relecture du plan. Utilisez `reject` pour arrêter. Chaque appel fait avancer le workflow et ferme la sandbox avant de rendre la main.

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

Lancez `node main.ts` pour afficher la prochaine question, le plan en attente ou le résultat. Dans une application, authentifiez la personne avant d’accepter le rôle `owner`.

```ts title="main.ts"
import { progress } from "./run.ts";

console.log(await progress());
```

## Examiner le résultat

Après approbation et validation, la branche nommée contient un commit de tests et `summary` décrit les modifications. Rien n’est fusionné. Lancez `npm test` sur cette branche et examinez la cause de l’échec : cet exemple vérifie seulement un code de sortie non nul, qui peut aussi signaler un problème du lanceur de tests. Vérifiez que l’échec démontre bien le comportement manquant.

La boucle autorise quatre tours. Un contrôle refusé laisse les modifications au tour suivant ; l’épuisement des tours fait échouer la tâche et conserve le travail. Les contrôles examinent les modifications finales, mais l’instruction de ne pas committer n’est pas une protection de sécurité. Après interruption, inspectez la branche avant d’autoriser une nouvelle tentative.

Continuez avec [l’implémentation et la relecture](../development-workflow/). Ce graphe plus complet démarre avec une nouvelle clé de ticket ; il réutilise ces fichiers, pas le checkpoint de cette leçon.
