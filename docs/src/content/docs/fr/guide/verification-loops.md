---
title: "Boucles de vérification"
description: "Faire recommencer un agent avec le retour d’une vérification, jusqu’à ce qu’elle accepte son travail ou que les tours soient épuisés, dans une seule tâche de workflow."
---

## Recommencer jusqu’à validation

`defineLoopTask()` alterne deux callbacks dans une seule tâche de workflow : `attempt` produit un candidat, `check` l’accepte ou dit ce qui ne va pas.

<!-- flow -->

1. **Essai**: Votre `attempt(context, feedback)` renvoie un candidat.
   - **Premier tour**: Le callback reçoit `undefined` comme feedback.
   - **Tours suivants**: Le callback reçoit le texte du dernier refus.
2. **Vérification**: Votre `check(context, candidate)` renvoie un verdict.
   - **Accepter**: Renvoyer `{ done: true }`.
   - **Refuser**: Renvoyer `{ done: false, feedback }` avec un texte.
3. **Suite**: Le verdict décide.
   - **Tour suivant**: Un refus alimente l’essai suivant.
   - **Terminé**: Le candidat accepté devient la valeur de la tâche.
   - **Épuisé**: Un refus au dernier tour fait échouer la tâche.
     - `LoopTaskExhausted`

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
console.log(result.value(fix)); // { round: 2, feedback: 'Cover the missing edge case.' }
```

<!-- check:run -->

Le tour 1 est refusé ; le tour 2 reçoit le feedback et il est accepté. `after`, `condition` et [`cache`](../task-cache/) fonctionnent comme sur les [autres tâches](../task-dependencies/).

## Coder, puis lancer une commande

L’agent travaille dans `attempt`, les tests tournent dans `check`, tous deux dans une même [sandbox chaude](../sandbox-sessions/).

```ts
import {
  createSandbox,
  defineAgentTask,
  defineLoopTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
});

const fix = defineLoopTask({
  key: "fix-tests",
  maxRounds: 4,
  async attempt(context, feedback) {
    const coding = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => ({
        brief: { text: `Fix the failing tests and commit.\n${feedback ?? ""}` },
      }),
    });
    const result = await coding.perform(context);
    return { summary: result.text, commits: result.commits.length };
  },
  async check(context) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal: context.signal,
    });
    return tests.status === 0
      ? { done: true }
      : { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
  },
});

const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
console.log(result.value(fix).summary);
```

`coding.perform(context)` rattache les tokens et l’annulation de l’agent à la boucle et à son [budget](../budgets/). `coder` sert à exécuter l’appel : seul `fix` entre dans le workflow. `attempt` renvoie du JSON, car un [checkpoint](../durable-runs/) sauvegarde chaque candidat, même refusé.

Un `npm test` en échec renvoie un `status` non nul, et sa sortie devient le feedback. À vous de choisir où l’envoyer : dans le brief suivant, comme ici, ou dans une [conversation poursuivie](../conversations/).

:::caution
Un `sandbox.dispatch()` direct échappe au budget et à l’annulation de la boucle. Passez-lui `context.signal` et déclarez ses tokens avec `context.reportUsage()`.
:::

## Faire relire par un second agent

`check` peut lancer un relecteur et transformer sa [réponse typée](../typed-responses/) en verdict. Les deux agents comptent dans le même budget.

```ts
import {
  createAgent,
  createClaudeHarness,
  defineAgentTask,
  defineJsonResponse,
} from "@elie-laloum/outpost";
import type {
  LoopCheckResult,
  LoopTaskContext,
  Sandbox,
} from "@elie-laloum/outpost";
import { z } from "zod";

declare const sandbox: Sandbox;

const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
const review = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});

async function reviewChanges(
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const reviewing = defineAgentTask({
    key: "reviewer",
    sandbox,
    request: () => ({
      agent: reviewer,
      response: review,
      brief: {
        text: 'Review the last commit. End with <review>{"approved": false, "feedback": "What to change"}</review>.',
      },
    }),
  });
  const { value } = await reviewing.perform(context);
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
| `timeoutMs`                     | Borne chaque tour. Il arrête les callbacks qui respectent `context.signal`.                                   |
| Une exception                   | Fait échouer la tâche aussitôt. Une tâche en boucle n’a pas d’option `retry`.                                 |
| La dernière vérification refuse | La tâche échoue avec `LoopTaskExhausted`, qui porte le dernier `feedback`. Les dépendants ne s’exécutent pas. |

[Réparer une CI en échec](../fix-failing-ci/) traite chaque issue dans un script complet.

## Checkpoint et reprise

Avec un [checkpoint](../durable-runs/), chaque candidat est sauvegardé avant `check`. À la reprise, un candidat sauvegardé passe directement à `check`, et les tours refusés ne sont pas rejoués.

Un tour interrompu n’est rejoué qu’avec `resume: "retry-incomplete"`, car il a peut-être déjà modifié des fichiers. Modifier `maxRounds` rend le checkpoint incompatible.

Chaque enregistrement de tâche liste ses `rounds`, et chaque phase émet un événement de workflow `loop`. `context.idempotencyKey` change à chaque tour et à chaque phase, pour dédupliquer les effets comme dans [Files de jobs et workers](../job-queues/).

API : [defineLoopTask](../../reference/definelooptask/) · [LoopTaskOptions](../../reference/looptaskoptions/) · [LoopTaskContext](../../reference/looptaskcontext/) · [LoopCheckResult](../../reference/loopcheckresult/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [defineAgentTask](../../reference/defineagenttask/).
