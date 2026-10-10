---
title: "Créer un workflow de développement"
description: "Passez d’un ticket aux questions, au plan validé, puis aux tests et au code vérifié."
---

Prolongez [la préparation des tests](../prepare-change-tests/) pour réaliser la modification, lancer les tests et demander une relecture. Gardez ses fichiers de planification et les fonctions partagées indiquées ci-dessous. Remplacez `workflow.ts` et `view.ts` par les versions de cette page. Utilisez une nouvelle clé de ticket : un checkpoint ne peut pas servir à un autre graphe.

Conservez ces fichiers partagés : `branch.ts`, `workbench.ts`, `commands.ts`, `git.ts`, `ask.ts`, `loop.types.ts`, `write-zones.ts`, `test-attempt.ts`, `test-check.ts`, `tests.ts`.

<!-- example:include plan-a-change ticket.ts frame.ts plan.ts approval.ts checkpoint.ts -->
<!-- example:include prepare-change-tests branch.ts workbench.ts commands.ts git.ts ask.ts loop.types.ts write-zones.ts test-attempt.ts test-check.ts tests.ts -->

[Télécharger tous les fichiers](../../../guide-examples/fr/development-workflow.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

Cette leçon reprend les fichiers de la précédente, pas son exécution enregistrée. Elle définit un autre graphe et doit démarrer avec son propre `runId` : le plan sera demandé de nouveau. Pour un seul parcours du ticket à la réalisation, utilisez directement le projet [Workflow de développement](../development-workflow/).

<!-- canvas -->

- **Plan**: Clarifier le ticket, proposer les tests et le code.
  - Agent
  - → **Approbation**: plan enregistré
- **Approbation**: Le responsable relit le plan.
  - Vous
  - → **Tests**: approuvé
  - → **Arrêt**: refusé
- **Tests**: Écrire et vérifier les tests attendus en échec, puis les committer.
  - Workflow
  - → **Implémenter**: tests acceptés
  - → **Arrêt**: tentatives épuisées
- **Implémenter**: Demander le changement de code sans modifier les tests.
  - Agent
  - → **Contrôler**: modification prête
- **Contrôler**: Vérifier les fichiers, exécuter npm test et obtenir la relecture.
  - Workflow
  - → **Implémenter**: sortie des tests ou retour de relecture
  - → **Branche**: tous les contrôles passent
  - → **Arrêt**: tentatives épuisées
- **Branche**: Committer le changement et le garder à relire ; aucune fusion.
  - Workflow
- **Arrêt**: Conserver le travail et le motif pour examen.
  - Workflow

Le verdict de relecture sert à la boucle de réalisation. Enregistrez son contrat dans `verdict.ts`.

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

export const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
```

## Écrire le script

Ajoutez ces fichiers dans le répertoire de l’exemple précédent.

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

Lancez `node main.ts` pour consulter la prochaine question, le plan en attente ou le résumé final. Votre application affiche `questions` dans un formulaire et `plan` sur une page de relecture. Chaque appel reconstruit le même workflow et le même checkpoint : il peut s’exécuter dans n’importe quel processus de la machine qui héberge le dépôt.

Créez ce point d’entrée pour lancer le workflow et afficher son état.

```ts title="main.ts"
import { progress } from "./run.ts";

console.log(await progress());
```

## Comprendre les étapes

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

Les vérifications s’enchaînent dans un ordre fixe, et le premier refus devient le retour du tour suivant :

| Boucle  | Vérification, dans l’ordre              | Refuse quand                                        |
| ------- | --------------------------------------- | --------------------------------------------------- |
| `tests` | Zone d’écriture                         | Aucun test modifié, ou un fichier hors test modifié |
| `tests` | Lancement rouge : `npm test`            | Les tests passent déjà : ils ne prouvent rien       |
| `code`  | Zone d’écriture                         | Un fichier de test modifié                          |
| `code`  | Lancement vert : `npm test`             | Les tests échouent ; leur sortie devient le retour  |
| `code`  | Agent relecteur, `defineJsonResponse()` | `approved` vaut `false`                             |

Le brief demande aux agents de ne pas committer. Chaque boucle ne commite qu’une fois toutes ses vérifications acceptées : un tour refusé laisse ses changements à corriger par la tentative suivante. `answer()` et `decide()` rendent la main après les tours d’agent suivants, qui peuvent durer plusieurs minutes : depuis une requête web, confiez-les à un [worker de file de jobs](../job-queues/).

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

- **Un refus termine l’exécution**: Un plan refusé saute la livraison et l’exécution se termine en `rejected`. Démarrez un nouveau `runId` avec la remarque du responsable dans le brief.
- **Plan mal formé**: `plan` lève une erreur, et l’exécution échoue sans redemander à l’agent. Utilisez une [tâche en boucle](../verification-loops/) pour laisser l’agent corriger son propre JSON.
- **Tours épuisés**: Une boucle dont la dernière vérification refuse échoue avec `LoopTaskExhausted` ; les tâches terminées restent dans le checkpoint et la branche garde les tests commités.
- **Même machine**: Le dépôt, ses worktrees et la conversation du cadrage doivent être accessibles au processus qui répond.
- **Tour interrompu**: Après un plantage juste après un commit, la vérification reprise ne trouve aucun changement et consomme un tour. Inspectez la branche avant de reprendre.
- **Travail conservé**: Le cadrage garde son worktree sur une branche `outpost/interactive-…` ; [nettoyez-le](../retention/) une fois terminé.

API : [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [createSandbox](../../reference/createsandbox/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).

<span id="clarifier-le-ticket-et-approuver-le-plan"></span>

[Clarifier et approuver une modification](../plan-a-change/).

<span id="ce-que-montre-lexemple"></span>

[Créer un workflow de développement](../development-workflow/).

<span id="préparer-et-réutiliser-la-sandbox"></span>
<span id="écrire-et-vérifier-les-tests"></span>
