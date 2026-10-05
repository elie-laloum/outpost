---
title: "Comparer les approches des agents"
description: "Lancez plusieurs candidats sur des branches séparées et choisissez un résultat à l’aide d’une vérification."
---

## Ce que montre l’exemple

:::caution[Expérimental]
`speculate()` est expérimental : ses options et son résultat peuvent encore changer. Il sélectionne une branche ; il ne la fusionne jamais.
:::

Cet exemple permet d’essayer plusieurs corrections pour un même bug. Chaque candidat dispose de sa sandbox et de sa branche ; votre commande de test décide quel résultat peut être accepté.

<!-- features -->

- [Candidats concurrents](../speculation/): Mettez en course jusqu’à huit candidats et gardez le premier acceptable.
- [Choisir un agent](../choose-an-agent/): Composez Codex et Claude Code à partir de leurs harness prédéfinis.
- [Claude Code](../claude-code/): Connectez-vous sur l’hôte ; l’image de l’installation contient déjà sa CLI.
- [Sessions de sandbox](../sandbox-sessions/): Lancez les tests dans la sandbox encore ouverte du candidat.
- [Budgets](../budgets/): Un seul budget borne les tentatives et les tokens de tous les candidats.
- [Dépôt et branche](../repository-and-branch/): Chaque candidat committe sur une branche nommée, dans son propre worktree.

## Écrire le script

Enregistrez les fichiers présentés dans les onglets à côté du `outpost.config.ts` de la page [Installation](../setup/). Exécutez `compete.ts` pour comparer les candidats.

Préparez les candidats et vérifiez leur travail avant d’envisager une fusion.

<!-- tabs -->

```ts title="candidate-agents.ts"
import {
  createAgent,
  createCodexHarness,
  createClaudeHarness,
} from "@elie-laloum/outpost";

export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="candidate-briefs.ts"
import { codex, claude } from "./candidate-agents.ts";

export const brief = {
  text: "Fix issue #42: dates before 1970 parse as NaN. Add a regression test, run npm test and commit the fix.",
};
export const candidates = [
  { key: "codex", agent: codex, request: { brief } },
  { key: "claude", agent: claude, request: { brief } },
];
```

```ts title="candidate-check.ts"
import type { SpeculationOptions } from "@elie-laloum/outpost";

export const validate: SpeculationOptions["validate"] = async ({
  result,
  sandbox,
  signal,
}) => {
  if (result.commits.length === 0) return false;
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
};
```

```ts title="run-candidates.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidate-briefs.ts";
import { validate } from "./candidate-check.ts";

export function runCandidates() {
  return speculate({
    repository,
    sandboxProvider,
    candidates,
    concurrency: 2,
    budget: { attempts: 2, usage: { output: 100_000 } },
    validate,
  });
}
```

```ts title="merge-check.ts"
import type { SpeculationResult } from "@elie-laloum/outpost";
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export function verifyWinner(winner: NonNullable<SpeculationResult["winner"]>) {
  return checkSpeculationIntegration(repository, winner.branch, winner.commit);
}
```

Demandez la confirmation dans `compete.ts`, puis vérifiez à nouveau l’intégration avant la fusion.

<!-- tabs -->

```ts title="merge-winner.ts"
import type { SpeculationResult } from "@elie-laloum/outpost";
import { verifyWinner } from "./merge-check.ts";
import { execFileSync } from "node:child_process";
import { repository } from "./outpost.config.ts";

export async function mergeWinner(
  winner: NonNullable<SpeculationResult["winner"]>,
) {
  const check = await verifyWinner(winner);
  if (check.status !== "clean")
    throw new Error(check.reason ?? `Conflicts: ${check.conflicts.join(", ")}`);
  execFileSync("git", ["merge", "--no-edit", winner.branch], {
    cwd: repository,
    stdio: "inherit",
  });
}
```

```ts title="merge-prompt.ts"
import { createInterface } from "node:readline/promises";

export async function askToMerge(branch: string) {
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return (await prompt.question(`Merge ${branch}? [y/N] `)) === "y";
  } finally {
    prompt.close();
  }
}
```

```ts title="compete.ts"
import { reportValue } from "./reporter.ts";
import { runCandidates } from "./run-candidates.ts";
import { askToMerge } from "./merge-prompt.ts";
import { mergeWinner } from "./merge-winner.ts";

export const result = await runCandidates();
for (const candidate of result.candidates)
  reportValue(candidate.key, candidate.status, candidate.branch);
// Example output: codex winner outpost/speculation/…/codex
export const { winner, integration } = result;
if (!winner) throw new Error(`No winner: ${result.status}`);
reportValue(`${winner.key} wins, integration: ${integration?.status}`);
// Example output: codex wins, integration: undefined
if (await askToMerge(winner.branch)) await mergeWinner(winner);
```

### Exécuter le script

Le script affiche le statut et la branche de chaque candidat, par exemple `claude winner outpost/speculation/<id>/claude` et `codex cancelled …`, puis demande avant de fusionner. Relisez la branche avec `git diff` avant de répondre.

```sh
node compete.ts
```

## Comprendre les étapes

Chaque lien indique qui transmet quoi à qui, dans le sens de la flèche.

<!-- canvas -->

- [Votre script](../speculation/): `compete.ts` appelle `speculate()`, affiche chaque candidat, puis demande avant de fusionner.
  - hôte
  - → **Admission**: `speculate()`
  - → **Checkout**: `git merge`, après votre réponse
- [Course](../speculation/): Chaque candidat part du commit actuel du checkout ; `concurrency` en exécute au plus autant à la fois.
  - workflow
  - **Admission**: chaque démarrage consomme une tentative de `budget.attempts` ; la limite de tokens les arrête tous
    - → **Sandboxes**: le même brief
  - **Validation**: sans commit, refusé ; sinon `npm test` tranche
  - **Sélection**: le premier qui passe gagne ; les autres sont annulés ou sautés
    - → **Votre script**: `winner`, `integration`
    - → **Checkout**: `git merge-tree`, en lecture seule
- [Sandboxes](../sandbox-sessions/): Une par candidat, sur `outpost/speculation/<id>/<key>` ; libérées à la fin, branches conservées.
  - sandbox
  - **codex**: corrige le bug et commite
  - **claude**: corrige le bug et commite
  - → **Validation**: commits, `npm test`
- **Checkout**: Votre branche. `checkSpeculationIntegration()` bloque la fusion si elle ou le gagnant a bougé depuis. Outpost ne pousse rien.
  - hôte

Référence API : [SpeculationResult](../../reference/speculationresult/), [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) et [SpeculationIntegration](../../reference/speculationintegration/).

## Adapter l’exemple

### Essayer plusieurs approches avec un seul agent

Donnez des briefs différents au même agent. Avec trois candidats et `concurrency: 2`, le troisième ne démarre que lorsqu’un des deux premiers termine sans gagner.

<!-- tabs -->

```ts title="approaches.ts"
import { coder } from "./outpost.config.ts";

export const approaches = {
  minimal: "Fix issue #42 with the smallest possible change.",
  parser: "Fix issue #42 by rewriting the date parser.",
  temporal: "Fix issue #42 by parsing dates with the Temporal API.",
};
export const candidates = Object.entries(approaches).map(([key, text]) => ({
  key,
  agent: coder,
  request: { brief: { text: `${text} Run npm test and commit.` } },
}));
```

```ts title="check-approach.ts"
import type { SpeculationOptions } from "@elie-laloum/outpost";

export const validate: SpeculationOptions["validate"] = async ({
  sandbox,
  signal,
}) => {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
};
```

```ts title="try-approaches.ts"
import { reportValue } from "./reporter.ts";
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./approaches.ts";
import { validate } from "./check-approach.ts";

export const result = await speculate({
  repository,
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: 3 },
  candidates,
  validate,
});
reportValue(result.winner?.key);
// Example output: codex
```

### Laisser un agent de revue trancher

Un relecteur lancé dans la sandbox du candidat lit ses commits et renvoie un [verdict typé](../typed-responses/). Passez la fonction en `validate: review`.

<!-- tabs -->

```ts title="review-agent.ts"
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="review-verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";

export const verdict = defineJsonResponse({
  tag: "verdict",
  schema(input) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("approved" in input) ||
      typeof input.approved !== "boolean"
    )
      throw new Error("Expected approved: boolean");
    return { approved: input.approved };
  },
});
```

```ts title="test-candidate.ts"
import type { SpeculativeValidation } from "@elie-laloum/outpost";

export async function testBranch({
  sandbox,
  signal,
}: SpeculativeValidation<undefined>) {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  return tests.status === 0;
}
```

```ts title="review-candidate.ts"
import type { SpeculativeValidation } from "@elie-laloum/outpost";
import { testBranch } from "./test-candidate.ts";
import { reviewer } from "./review-agent.ts";
import { verdict } from "./review-verdict.ts";

export async function review(candidate: SpeculativeValidation<undefined>) {
  if (!(await testBranch(candidate))) return false;
  const { sandbox, signal } = candidate;
  const { value } = await sandbox.dispatch({
    agent: reviewer,
    brief: {
      text: 'Review the commits on this branch for correctness. Do not change any file. Answer <verdict>{"approved":true}</verdict> or false.',
    },
    response: verdict,
    signal,
  });
  return value.approved;
}
```

Les tokens de la revue ne comptent pas dans `budget`. Le commit du gagnant est lu après `validate` : le relecteur ne doit donc pas committer.

### Reprendre après un arrêt brutal

Passez `durability` à `speculate()` : tentatives, usage et résultats sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être rejouée.

```ts
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "issue-42",
  version: "1",
};
```

`version` fait partie de l’identité de la course : après avoir modifié les candidats ou `validate`, lancez une nouvelle course sous un nouveau `runId`. Une course durable exige un fournisseur capable de récupération, aujourd’hui Docker ou Podman en mode monté, et conserve le worktree de chaque candidat. Après un arrêt brutal, récupérez la course avant de la rejouer : [Candidats concurrents](../speculation/).

## Limites

- `speculate()` ne fusionne pas, ne pousse pas et n’ouvre pas de pull request.
- Une intégration `clean` n’est pas un verrou : toute modification ultérieure du checkout la rend obsolète, vérifiez donc à nouveau juste avant de fusionner.
- Les candidats en cours peuvent dépasser la limite de tokens avant que leur usage soit remonté.
- Un worktree avec des fichiers non commités, non suivis ou ignorés, comme `node_modules`, reste sous `.outpost/workspaces` : voir [Rétention et nettoyage](../retention/).

API : [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [SpeculationDurability](../../reference/speculationdurability/).
