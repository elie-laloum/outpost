---
title: "Réparer une CI en échec"
description: "Laissez un agent corriger le code et réessayer jusqu’à ce que votre commande de test réussisse."
---

## Ce que montre l’exemple

<!-- features -->

- [Sessions de sandbox](../sandbox-sessions/): Une sandbox à chaud garde les dépendances entre les tours de l’agent et les tests.
- [Dépôt et branche](../repository-and-branch/): La correction arrive sur une branche nommée, jamais sur votre checkout.
- [Préparer l’environnement](../environment-setup/): Les dépendances s’installent une fois, avant le premier tour.
- [Boucles de vérification](../verification-loops/): Tenter, vérifier, renvoyer l’échec, recommencer.
- [Budgets](../budgets/): Plafonner les tentatives et les tokens de toute l’exécution.
- [Exécuter en CI](../ci-automation/): Une exécution en échec lève une erreur, le job sort donc avec un code non nul.

## Écrire le script

Enregistrez les fichiers présentés dans les onglets à côté de la configuration de la page [Installation](../setup/). Le script principal garde une sandbox ouverte pour que les modifications de l’agent et votre commande de test utilisent les mêmes fichiers.

Séparez la création de la sandbox, la tentative de l’agent et la vérification des commits.

<!-- tabs -->

```ts title="fix-sandbox.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export function openFixSandbox() {
  return createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-ci" },
    hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  });
}
```

```ts title="fix-request.ts"
export function fixRequest(feedback?: string) {
  return {
    brief: {
      text: [
        "`npm test` fails. Fix the code so that it passes, then commit the fix.",
        feedback ? `The last check failed:\n${feedback}` : "",
      ].join("\n\n"),
    },
  };
}
```

```ts title="fix-attempt.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { fixRequest } from "./fix-request.ts";

export function createAttempt(sandbox: Sandbox) {
  return async (context: LoopTaskContext, feedback: string | undefined) => {
    const agent = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => fixRequest(feedback),
    });
    const result = await agent.perform(context);
    return { summary: result.text, commits: result.commits.length };
  };
}
```

```ts title="test-command.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";

export async function testCommand(sandbox: Sandbox, context: LoopTaskContext) {
  return sandbox.command({
    executable: "npm",
    arguments: ["test"],
    retain: 20_000,
    signal: context.signal,
  });
}
```

```ts title="check-commit.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";

export async function checkCommit(
  sandbox: Sandbox,
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const status = await sandbox.command({
    executable: "git",
    arguments: ["status", "--porcelain"],
    signal: context.signal,
  });
  const feedback = `Tests pass. Commit these changes:\n${status.stdout}`;
  return status.stdout.trim() ? { done: false, feedback } : { done: true };
}
```

Assemblez la boucle et lancez `fix-ci.ts`, qui possède et ferme la sandbox.

<!-- tabs -->

```ts title="fix-check.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";
import { testCommand } from "./test-command.ts";
import { checkCommit } from "./check-commit.ts";

export function createCheck(sandbox: Sandbox) {
  return async (context: LoopTaskContext): Promise<LoopCheckResult> => {
    const tests = await testCommand(sandbox, context);
    if (tests.status !== 0)
      return { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
    return checkCommit(sandbox, context);
  };
}
```

```ts title="fix-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineLoopTask } from "@elie-laloum/outpost";
import { createAttempt } from "./fix-attempt.ts";
import { createCheck } from "./fix-check.ts";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
    key: "fix",
    maxRounds: 4,
    timeoutMs: 1_200_000,
    attempt: createAttempt(sandbox),
    check: createCheck(sandbox),
  });
}
```

```ts title="fix-ci.ts"
import { reportValue } from "./reporter.ts";
import { openFixSandbox } from "./fix-sandbox.ts";
import { defineFix } from "./fix-task.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
await using sandbox = await openFixSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});
reportValue(`status: ${result.status}`);
// Example output: status: done
reportValue(`branch: ${sandbox.workspace.branch}`);
// Example output: branch: outpost/fix-ci
reportValue(`rounds: ${result.tasks[0]?.rounds?.length ?? 0}`);
// Example output: rounds: 2
reportValue(`tokens: ${JSON.stringify(result.usage.tokens)}`);
// Example output: tokens: {"input":1200,"cached":0,"output":320}
if (result.status === "done") reportValue(result.value(fix).summary);
// Example output: Fixed the parser and verified the tests.
result.unwrap();
```

### Exécuter le script

Lancez la boucle de vérification, puis examinez les commits de sa branche. Le script affiche le statut, le nombre de tours et la consommation de tokens ; il se termine en erreur si le workflow échoue.

```sh
node fix-ci.ts
git log --oneline HEAD..outpost/fix-ci
```

:::caution
L’agent peut modifier les tests ou le script `test`. Relisez le diff, et laissez votre CI relancer les tests sur la branche poussée.
:::

## Comprendre les étapes

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre script](../ci-automation/): `fix-ci.ts` ouvre la sandbox, démarre le workflow avec son `budget` et fixe le code de sortie.
  - hôte
  - → **Sandbox**: `createSandbox()`
  - → **Tentative**: `workflow.start()`
- [Boucle](../verification-loops/): `defineLoopTask()`, 4 tours au plus, chacun limité par `timeoutMs`.
  - workflow
  - **Tentative**: le brief, plus le dernier échec
    - → **Agent**: `perform(context)`
  - **Vérification**: `npm test` doit sortir avec 0, puis l’arbre doit être propre ; les 20 000 derniers caractères de sortie deviennent le retour
    - → **Commandes**: `sandbox.command()`
- [Sandbox](../sandbox-sessions/): Reste ouverte d’un tour à l’autre : dépendances et modifications sont conservées.
  - sandbox
  - **Commandes**: `npm ci` une fois, avant le premier tour ; `npm test` à chaque tour
  - **Agent**: modifie et commite ; ses tokens comptent dans `budget`
  - → **Branche**: commits
- **Branche**: `outpost/fix-ci` dans `.outpost/workspaces` ; `await using` ferme la sandbox et la conserve. Rien n’est fusionné ni poussé.
  - hôte

`perform(context)` relie l’usage et l’annulation de l’agent au workflow : ses tokens comptent dans `budget`. `timeoutMs` borne chaque tour.

| Issue                                   | `result.status` | `result.errors`                      | Code de sortie |
| --------------------------------------- | --------------- | ------------------------------------ | -------------- |
| Une vérification accepte le tour        | `"done"`        | Vide                                 | 0              |
| La quatrième vérification refuse        | `"failed"`      | `LoopTaskExhausted`, avec `feedback` | 1              |
| Les tokens ou les tentatives s’épuisent | `"failed"`      | `WorkflowBudgetExceeded`             | 1              |
| L’agent ou une commande lève une erreur | `"failed"`      | L’erreur levée                       | 1              |

`result.unwrap()` lève une `WorkflowFailure` pour toutes les lignes sauf la première. Une limite de tokens arrête aussi l’agent en cours.

## Adapter l’exemple

| Variante                  | Changement                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un autre agent            | Passez un [agent de secours](../fallback-agents/) comme `agent` : `createFallbackAgent([claude, codex], { on: ["quota", "unavailable"] })` change d’agent sur une limite d’usage ou une panne.                |
| L’exécuter en CI          | Utilisez un [identifiant pour l’exécution sans surveillance](../ci-automation/), nommez la branche par exécution (`` `outpost/fix-ci-${process.env.GITHUB_RUN_ID}` ``), puis `git push origin` cette branche. |
| Vérification plus stricte | Ajoutez `npm run lint` ou une vérification de types après les tests, ou demandez l’avis d’un agent relecteur depuis `check` ([Boucles de vérification](../verification-loops/)).                              |
| Sandbox cloud             | Remplacez `sandboxProvider` par un [fournisseur Vercel ou Daytona](../cloud-sandboxes/). Les commits reviennent sur la branche de l’hôte.                                                                     |

API : [createSandbox](../../reference/createsandbox/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [WorkflowBudget](../../reference/workflowbudget/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [WorkflowFailure](../../reference/workflowfailure/).
