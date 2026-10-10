---
title: "Réparer une CI en échec"
description: "Laissez un agent corriger le code et réessayer jusqu’à ce que votre commande de test réussisse."
---

[Télécharger tous les fichiers](../../../guide-examples/fr/fix-failing-ci.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

<!-- canvas -->

- **Corriger**: L’agent modifie et committe sur la branche de travail.
  - Agent
  - → **Contrôler**: prêt à vérifier
- **Contrôler**: Les tests doivent passer et le répertoire de travail être propre.
  - Votre contrôle
  - → **Corriger**: à corriger
  - → **Relire la branche**: validé
  - → **Arrêter**: tours épuisés
- **Relire la branche**: Examiner outpost/fix-ci ; rien n’est fusionné ni poussé.
  - Vous
- **Arrêter**: Conserver le travail pour examen.
  - Workflow

## Écrire le script

Enregistrez les fichiers présentés dans les onglets à côté de la configuration de la page [Installation](../setup/). Le script principal garde une sandbox ouverte pour que les modifications de l’agent et votre commande de test utilisent les mêmes fichiers.

Séparez la création de la sandbox, la tentative de l’agent et la vérification des commits.

L’allocation et la fermeture restent dans le point d’entrée. La boucle regroupe la tentative et le contrôle pour rendre leur enchaînement visible.

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

```ts title="fix-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask, defineLoopTask } from "@elie-laloum/outpost";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
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
              "npm test fails. Fix the code, run the tests and commit the fix.",
              feedback ? `Previous check:\n${feedback}` : "",
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
      if (status.status !== 0) throw new Error(status.stderr);
      if (status.stdout.trim())
        return {
          done: false,
          feedback: `Tests pass. Commit the changes:\n${status.stdout}`,
        };
      return { done: true };
    },
  });
}
```

```ts title="fix-ci.ts"
import { openFixSandbox } from "./fix-sandbox.ts";
import { defineFix } from "./fix-task.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
await using sandbox = await openFixSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});
console.log(`status: ${result.status}`);
// Example output: status: done
console.log(`branch: ${sandbox.workspace.branch}`);
// Example output: branch: outpost/fix-ci
console.log(`rounds: ${result.tasks[0]?.rounds?.length ?? 0}`);
// Example output: rounds: 2
console.log(`tokens: ${JSON.stringify(result.usage.tokens)}`);
// Example output: tokens: {"input":1200,"cached":0,"output":320}
if (result.status === "done") console.log(result.value(fix).summary);
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

, dans le sens de la flèche.

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
