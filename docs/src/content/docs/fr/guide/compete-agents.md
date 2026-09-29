---
title: "Mettre des agents en concurrence"
description: "Confier le même bug à Codex et à Claude Code, tester chaque correctif dans sa propre sandbox, garder le premier qui passe et vérifier qu’il se fusionne proprement."
---

## Ce que vous utilisez

:::caution[Expérimental]
`speculate()` est expérimental : ses options et son résultat peuvent encore changer. Il sélectionne une branche ; il ne la fusionne jamais.
:::

Chaque candidat corrige le bug sur sa propre branche, dans sa propre sandbox. Vos tests désignent le gagnant.

<!-- features -->

- [Candidats concurrents](../speculation/): Mettez en course jusqu’à huit candidats et gardez le premier acceptable.
  - `speculate()`
  - `checkSpeculationIntegration()`
- [Choisir un agent](../choose-an-agent/): Composez Codex et Claude Code à partir de leurs harness prédéfinis.
  - `createCodexHarness()`
  - `createClaudeHarness()`
- [Claude Code](../claude-code/): Connectez-vous sur l’hôte ; l’image de l’installation contient déjà sa CLI.
- [Sessions de sandbox](../sandbox-sessions/): Lancez les tests dans la sandbox encore ouverte du candidat.
  - `sandbox.command()`
- [Budgets](../budgets/): Un seul budget borne les tentatives et les tokens de tous les candidats.
  - `budget`
- [Dépôt et branche](../repository-and-branch/): Chaque candidat committe sur une branche nommée, dans son propre worktree.

## Le code

Le fichier se place à côté du `outpost.config.mts` de l’[installation](../setup/).

```ts title="compete.mts"
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import {
  checkSpeculationIntegration,
  createAgent,
  createClaudeHarness,
  createCodexHarness,
  speculate,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const brief = {
  text: "Fix issue #42: dates before 1970 parse as NaN. Add a regression test, run npm test and commit the fix.",
};

const result = await speculate({
  repository,
  sandboxProvider,
  candidates: [
    {
      key: "codex",
      agent: createAgent({
        harness: createCodexHarness({ authentication: "account" }),
      }),
      request: { brief },
    },
    {
      key: "claude",
      agent: createAgent({
        harness: createClaudeHarness({ authentication: "account" }),
      }),
      request: { brief },
    },
  ],
  concurrency: 2,
  budget: { attempts: 2, usage: { output: 100_000 } },
  async validate({ result, sandbox, signal }) {
    if (result.commits.length === 0) return false;
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return tests.status === 0;
  },
});

for (const candidate of result.candidates)
  console.log(candidate.key, candidate.status, candidate.branch);

const { winner, integration } = result;
if (!winner) throw new Error(`No winner: ${result.status}`);
console.log(`${winner.key} wins, integration: ${integration?.status}`);

const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const answer = await prompt.question(`Merge ${winner.branch}? [y/N] `);
prompt.close();

if (answer === "y") {
  const check = await checkSpeculationIntegration(
    repository,
    winner.branch,
    winner.commit,
  );
  if (check.status !== "clean")
    throw new Error(check.reason ?? `Conflicts: ${check.conflicts.join(", ")}`);
  execFileSync("git", ["merge", "--no-edit", winner.branch], {
    cwd: repository,
    stdio: "inherit",
  });
}
```

```sh
node compete.mts
```

Le script affiche le statut et la branche de chaque candidat, par exemple `claude winner outpost/speculation/<id>/claude` et `codex cancelled …`, puis demande avant de fusionner. Relisez la branche avec `git diff` avant de répondre.

## Comment ça marche

<!-- flow -->

1. **Démarrage**: Tous les candidats partent du même commit.
   - **Figer la base**: `speculate()` enregistre le commit courant du checkout.
     - hôte
   - **Ouvrir une branche par candidat**: `outpost/speculation/<id>/<key>`, avec son worktree et sa sandbox.
     - hôte
     - sandbox
2. **Course**: Au plus `concurrency` candidats tournent en même temps.
   - **Admettre**: Chaque démarrage consomme une des `budget.attempts` ; la limite de tokens arrête tous les candidats en cours dès qu’elle est atteinte.
   - **Exécuter le brief**: L’agent corrige le bug et committe.
     - sandbox
   - **Valider**: `validate` rejette un candidat sans commit, puis lance `npm test` dans sa sandbox.
     - `validate`
     - sandbox
3. **Sélection**: Le premier candidat qui passe et se ferme proprement gagne.
   - **Arrêter les autres**: Les candidats en cours sont annulés, ceux en attente sont ignorés.
   - **Fermer**: Les sandboxes sont libérées, les worktrees propres supprimés, les branches conservées.
     - hôte
   - **Vérifier l’intégration**: `git merge-tree` teste le gagnant contre le `HEAD` du checkout sans toucher à vos fichiers.
     - `result.integration`
     - hôte
4. **Fusion**: Votre code, après votre réponse.
   - **Vérifier à nouveau**: `checkSpeculationIntegration()` bloque si le checkout ou la branche a bougé entre-temps.
     - hôte
   - **Fusionner**: `git merge` s’exécute sur votre checkout. Outpost ne pousse rien.
     - hôte

`result.status` vaut `winner`, `no-winner`, `budget-exhausted`, `quota` (une limite d’usage a arrêté un candidat, voir [Pauses sur quota](../quota-pauses/)) ou `aborted` (votre `signal`). Chaque candidat a son propre statut :

| Statut du candidat | Signification                                                                   |
| ------------------ | ------------------------------------------------------------------------------- |
| `winner`           | A passé `validate` en premier.                                                  |
| `rejected`         | `validate` a renvoyé `false`.                                                   |
| `failed`           | Une erreur dans la sandbox, l’agent, `validate` ou la fermeture ; voir `error`. |
| `quota`            | Une limite d’usage ou de débit l’a arrêté.                                      |
| `cancelled`        | Arrêté par un gagnant, le budget ou votre `signal`.                             |
| `skipped`          | N’a jamais démarré.                                                             |

`integration.status` vaut `clean`, `conflict` (chemins des fichiers dans `conflicts`) ou `blocked` (`reason` : modifications non commitées, `HEAD` détaché, branche déplacée ou Git sans `merge-tree --write-tree`).

## L’adapter

### Essayer plusieurs approches avec un seul agent

Donnez des briefs différents au même agent. Avec trois candidats et `concurrency: 2`, le troisième ne démarre que lorsqu’un des deux premiers termine sans gagner.

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const approaches = {
  minimal: "Fix issue #42 with the smallest possible change.",
  parser: "Fix issue #42 by rewriting the date parser.",
  temporal: "Fix issue #42 by parsing dates with the Temporal API.",
};

const result = await speculate({
  repository,
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: 3 },
  candidates: Object.entries(approaches).map(([key, text]) => ({
    key,
    agent: coder,
    request: { brief: { text: `${text} Run npm test and commit.` } },
  })),
  async validate({ sandbox, signal }) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return tests.status === 0;
  },
});
console.log(result.winner?.key);
```

### Laisser un agent de revue trancher

Un relecteur lancé dans la sandbox du candidat lit ses commits et renvoie un [verdict typé](../typed-responses/). Passez la fonction en `validate: review`.

```ts
import {
  createAgent,
  createClaudeHarness,
  defineJsonResponse,
  type SpeculativeValidation,
} from "@elie-laloum/outpost";

const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
const verdict = defineJsonResponse({
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

export async function review({
  sandbox,
  signal,
}: SpeculativeValidation<undefined>) {
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
    signal,
  });
  if (tests.status !== 0) return false;
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

### Survivre à un crash

Passez `durability` à `speculate()` : tentatives, usage et résultats sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être rejouée.

```ts
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "issue-42",
  version: "1",
};
```

`version` fait partie de l’identité de la course : après avoir modifié les candidats ou `validate`, lancez une nouvelle course sous un nouveau `runId`. Une course durable exige un provider capable de récupération, aujourd’hui Docker ou Podman en mode monté, et conserve le worktree de chaque candidat. Après un crash, récupérez la course avant de la rejouer : [Candidats concurrents](../speculation/).

## Limites

- `speculate()` ne fusionne pas, ne pousse pas et n’ouvre pas de pull request.
- Une intégration `clean` n’est pas un verrou : toute modification ultérieure du checkout la rend obsolète, vérifiez donc à nouveau juste avant de fusionner.
- Les candidats en cours peuvent dépasser la limite de tokens avant que leur usage soit remonté.
- Un worktree avec des fichiers non commités, non suivis ou ignorés, comme `node_modules`, reste sous `.outpost/workspaces` : voir [Rétention et nettoyage](../retention/).

API : [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [SpeculationDurability](../../reference/speculationdurability/).
