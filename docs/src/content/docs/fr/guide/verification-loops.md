---
title: "Vérifier le travail et réessayer"
description: "Utilisez les tests ou une revue pour accepter le travail d’un agent ou demander une nouvelle tentative."
---

Utilisez une boucle lorsque votre code peut décider si le résultat est acceptable. Pour l’exemple avec agent et tests, préparez d’abord la [configuration](../setup/) et les [dépendances](../environment-setup/). Relancer après une erreur d’exécution et corriger après un contrôle refusé sont deux décisions distinctes.

[Télécharger tous les fichiers](../../../guide-examples/fr/verification-loops.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

## Recommencer jusqu’à validation

Définissez une tentative et une vérification avec `defineLoopTask()`. La vérification accepte le résultat ou renvoie des indications pour la tentative suivante. Fixez `maxRounds` pour arrêter la boucle si aucun résultat ne passe.

<!-- canvas -->

- **Tentative**: Produire ou corriger un candidat.
  - Agent
  - → **Contrôle**: candidat prêt
- **Contrôle**: Exécuter votre validation.
  - Votre contrôle
  - → **Tentative**: à corriger
  - → **Résultat**: accepté
  - → **Échec**: tours épuisés
- **Résultat**: Renvoyer le candidat accepté.
  - Workflow
- **Échec**: Arrêter avec LoopTaskExhausted.
  - Workflow

```ts
import { defineLoopTask, defineWorkflow } from "@elie-laloum/outpost";

const fix = defineLoopTask({
  key: "fix",
  maxRounds: 3,
  attempt: (context, feedback) => ({
    round: context.round,
    feedback: feedback ?? "",
  }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});

const result = await defineWorkflow("verified", [fix]).start();
result.unwrap();
console.log(result.value(fix));
// Example output: { round: 2, feedback: 'Cover the missing edge case.' }
```

<!-- check:run -->

La première tentative est refusée. La deuxième reçoit les indications de la vérification et produit un résultat accepté. Les options `after`, `condition` et [`cache`](../task-cache/) fonctionnent comme pour les [autres tâches](../task-dependencies/).

## Coder, puis lancer une commande

L’agent travaille dans `attempt`, les tests tournent dans `check`, tous deux dans une même [sandbox chaude](../sandbox-sessions/).

Séparez la sandbox, la tentative et la vérification pour faciliter la lecture de chaque étape.

<!-- tabs -->

```ts title="loop-sandbox.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export function openLoopSandbox() {
  return createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
  });
}
```

```ts title="coding-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";

export function codingTask(sandbox: Sandbox, feedback?: string) {
  return defineAgentTask({
    key: "coder",
    sandbox,
    request: () => ({
      brief: { text: `Fix the failing tests and commit.\n${feedback ?? ""}` },
    }),
  });
}
```

```ts title="loop-attempt.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";
import { codingTask } from "./coding-task.ts";

export function createAttempt(sandbox: Sandbox) {
  return async (context: LoopTaskContext, feedback: string | undefined) => {
    const result = await codingTask(sandbox, feedback).perform(context);
    return { summary: result.text, commits: result.commits.length };
  };
}
```

```ts title="loop-check.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";

export function createCheck(sandbox: Sandbox) {
  return async (context: LoopTaskContext): Promise<LoopCheckResult> => {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal: context.signal,
    });
    return tests.status === 0
      ? { done: true }
      : { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
  };
}
```

```ts title="fix-loop.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineLoopTask } from "@elie-laloum/outpost";
import { createAttempt } from "./loop-attempt.ts";
import { createCheck } from "./loop-check.ts";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
    key: "fix-tests",
    maxRounds: 4,
    attempt: createAttempt(sandbox),
    check: createCheck(sandbox),
  });
}
```

Lancez `run-loop.ts` : il garde la sandbox ouverte jusqu’à la fin du workflow.

<!-- tabs -->

```ts title="run-loop.ts"
import { openLoopSandbox } from "./loop-sandbox.ts";
import { defineFix } from "./fix-loop.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

await using sandbox = await openLoopSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
console.log(result.value(fix).summary);
// Example output: Fixed the parser and verified the tests.
```

`coding.perform(context)` rattache les tokens et l’annulation de l’agent à la boucle et à son [budget](../budgets/). `coder` sert à exécuter l’appel : seul `fix` entre dans le workflow. `attempt` renvoie du JSON, car un [checkpoint](../durable-runs/) sauvegarde chaque candidat, même refusé.

Un `npm test` en échec renvoie un `status` non nul, et sa sortie devient le retour de la vérification. À vous de choisir où l’envoyer : dans le brief suivant, comme ici, ou dans une [conversation poursuivie](../conversations/).

:::caution
Un `sandbox.dispatch()` direct échappe au budget et à l’annulation de la boucle. Passez-lui `context.signal` et déclarez ses tokens avec `context.reportUsage()`.
:::

## Faire relire par un second agent

`check` peut lancer un relecteur et transformer sa [réponse typée](../typed-responses/) en verdict. Les deux agents comptent dans le même budget.

<!-- tabs -->

```ts title="review-settings.ts"
import {
  createAgent,
  createClaudeHarness,
  defineJsonResponse,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
export const review = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
export const brief = {
  text: 'Review the last commit. End with <review>{"approved": false, "feedback": "What to change"}</review>.',
};
```

```ts title="reviewing-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { reviewer, review, brief } from "./review-settings.ts";

export declare const sandbox: Sandbox;
export function reviewingTask() {
  return defineAgentTask({
    key: "reviewer",
    sandbox,
    request: () => ({ agent: reviewer, response: review, brief }),
  });
}
```

```ts title="review-changes.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";
import { reviewingTask } from "./reviewing-task.ts";

export async function reviewChanges(
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const { value } = await reviewingTask().perform(context);
  return value.approved
    ? { done: true }
    : { done: false, feedback: value.feedback };
}
```

Passez-la comme `check: reviewChanges`. L’`agent` de la requête remplace celui de la sandbox pour ce seul dispatch.

## Limites

| Limite ou événement             | Ce qui se passe                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `maxRounds`                     | Plafonne les tours, reprises comprises.                                                                       |
| Tentatives du workflow          | Chaque tour, et chaque rejeu d’un tour interrompu, compte dans `budget.attempts`.                             |
| `timeoutMs`                     | Borne chaque tour. Il arrête les fonctions de rappel qui respectent `context.signal`.                         |
| Une exception                   | Fait échouer la tâche aussitôt. Une tâche en boucle n’a pas d’option `retry`.                                 |
| La dernière vérification refuse | La tâche échoue avec `LoopTaskExhausted`, qui porte le dernier `feedback`. Les dépendants ne s’exécutent pas. |

[Réparer une CI en échec](../fix-failing-ci/) traite chaque issue dans un script complet.

## Checkpoint et reprise

Avec un [checkpoint](../durable-runs/), chaque candidat est sauvegardé avant `check`. À la reprise, un candidat sauvegardé passe directement à `check`, et les tours refusés ne sont pas rejoués.

Un tour interrompu n’est rejoué qu’avec `resume: "retry-incomplete"`, car il a peut-être déjà modifié des fichiers. Modifier `maxRounds` rend le checkpoint incompatible.

Chaque enregistrement de tâche liste ses `rounds`, et chaque phase émet un événement de workflow `loop`. `context.idempotencyKey` change à chaque tour et à chaque phase, pour dédupliquer les effets comme dans [Files de jobs et workers](../job-queues/).

API : [defineLoopTask](../../reference/definelooptask/) · [LoopTaskOptions](../../reference/looptaskoptions/) · [LoopTaskContext](../../reference/looptaskcontext/) · [LoopCheckResult](../../reference/loopcheckresult/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [defineAgentTask](../../reference/defineagenttask/).
