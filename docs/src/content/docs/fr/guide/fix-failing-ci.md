---
title: "Réparer une CI en échec"
description: "Un agent corrige les tests en échec sur une branche, et Outpost les relance après chaque tentative en lui renvoyant les échecs. Vous obtenez une branche à relire et un résumé pour le journal de CI ; le job échoue quand les tours, les tentatives ou les tokens sont épuisés."
---

## Ce que vous utilisez

<!-- features -->

- [Sessions de sandbox](../sandbox-sessions/): Une sandbox à chaud garde les dépendances entre les tours de l’agent et les tests.
  - `createSandbox()`
  - `sandbox.command()`
- [Dépôt et branche](../repository-and-branch/): La correction arrive sur une branche nommée, jamais sur votre checkout.
  - `named`
- [Préparer l’environnement](../environment-setup/): Les dépendances s’installent une fois, avant le premier tour.
  - `sandboxReady`
- [Boucles de vérification](../verification-loops/): Tenter, vérifier, renvoyer l’échec, recommencer.
  - `defineLoopTask()`
  - `defineAgentTask()`
- [Budgets](../budgets/): Plafonner les tentatives et les tokens de toute l’exécution.
  - `budget`
- [Exécuter en CI](../ci-automation/): Une exécution en échec lève une erreur, le job sort donc avec un code non nul.
  - `unwrap()`

## Le script

Placez-le à côté du `outpost.config.mts` d’[Installation](../setup/).

```ts title="fix-ci.mts"
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
  branch: { mode: "named", name: "outpost/fix-ci" },
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
});

const fix = defineLoopTask({
  key: "fix",
  maxRounds: 4,
  timeoutMs: 1_200_000,
  async attempt(context, feedback) {
    const agent = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => ({
        brief: {
          text: [
            "`npm test` fails. Fix the code so that it passes, then commit the fix.",
            feedback ? `The last check failed:\n${feedback}` : "",
          ].join("\n\n"),
        },
      }),
    });
    const result = await agent.perform(context);
    return { summary: result.text, commits: result.commits.length };
  },
  async check(context) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      retain: 20_000,
      signal: context.signal,
    });
    if (tests.status !== 0)
      return { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
    const status = await sandbox.command({
      executable: "git",
      arguments: ["status", "--porcelain"],
      signal: context.signal,
    });
    return status.stdout.trim()
      ? {
          done: false,
          feedback: `Tests pass. Commit these changes:\n${status.stdout}`,
        }
      : { done: true };
  },
});

const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});

const rounds = result.tasks.find((task) => task.key === "fix")?.rounds;
console.log(`status: ${result.status}`);
console.log(`branch: ${sandbox.workspace.branch}`);
console.log(`rounds: ${rounds?.length ?? 0}`);
console.log(`tokens: ${JSON.stringify(result.usage.tokens)}`);
if (result.status === "done") console.log(result.value(fix).summary);
result.unwrap();
```

```sh
node fix-ci.mts
git log --oneline HEAD..outpost/fix-ci
```

:::caution
L’agent peut modifier les tests ou le script `test`. Relisez le diff, et laissez votre CI relancer les tests sur la branche poussée.
:::

## Comment ça marche

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre script](../ci-automation/): `fix-ci.mts` ouvre la sandbox, démarre le workflow avec son `budget` et fixe le code de sortie.
  - hôte
  - → **Sandbox**: `createSandbox()`
  - → **Tentative**: `workflow.start()`
- [Boucle](../verification-loops/): `defineLoopTask()`, 4 tours au plus, chacun borné par `timeoutMs`.
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

## L’adapter

| Variante                  | Changement                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un autre agent            | Passez un [agent de secours](../fallback-agents/) comme `agent` : `createFallbackAgent([claude, codex], { on: ["quota", "unavailable"] })` change d’agent sur une limite d’usage ou une panne.                |
| L’exécuter en CI          | Utilisez un [identifiant pour l’exécution sans surveillance](../ci-automation/), nommez la branche par exécution (`` `outpost/fix-ci-${process.env.GITHUB_RUN_ID}` ``), puis `git push origin` cette branche. |
| Vérification plus stricte | Ajoutez `npm run lint` ou une vérification de types après les tests, ou demandez l’avis d’un agent relecteur depuis `check` ([Boucles de vérification](../verification-loops/)).                              |
| Sandbox cloud             | Remplacez `sandboxProvider` par un [provider Vercel ou Daytona](../cloud-sandboxes/). Les commits reviennent sur la branche de l’hôte.                                                                        |

API : [createSandbox](../../reference/createsandbox/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [WorkflowBudget](../../reference/workflowbudget/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [WorkflowFailure](../../reference/workflowfailure/).
