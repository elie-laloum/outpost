---
title: "Exécuter des candidats concurrents"
description: "Essayez plusieurs candidats avec une validation, des budgets et une intégration explicites."
---

## Mettre des candidats en concurrence

:::caution[Expérimental]
`speculate()` est expérimental : ses options et son résultat peuvent encore changer. Il sélectionne une branche ; il ne la fusionne jamais.
:::

Utilisez `speculate()` pour lancer plusieurs candidats sur une même tâche et valider explicitement chaque résultat. Les candidats ont des branches et des sandboxes séparées ; un gagnant est choisi uniquement si votre vérification l’accepte.

Référence API : [SpeculationOptions](../../reference/speculationoptions/).

Pour un scénario complet opposant Codex à Claude Code, voir la recette [Mettre des agents en concurrence](../compete-agents/).

<!-- tabs -->

```ts title="candidates.ts"
import { coder } from "./outpost.config.ts";

export const candidates = ["minimal", "refactor"].map((key) => ({
  key,
  agent: coder,
  request: {
    brief: { text: `Fix the parser with a ${key} change. Test and commit.` },
  },
}));
```

```ts title="validate.ts"
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

```ts title="compete.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";

export const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates,
  validate,
});
console.log(result.status, result.winner?.branch);
```

## Valider le comportement réel

`validate` reçoit la `key` du candidat, le `result` de son dispatch et sa `sandbox`, encore ouverte. Lancez-y vos tests et renvoyez `true` seulement s’ils passent : un agent qui affirme avoir réussi ne prouve rien.

Passez `signal` à chaque commande. Il se déclenche quand un autre candidat gagne ou que la course s’arrête.

Le `commit` du gagnant est le `HEAD` lu après le retour de `validate`. Un commit créé pendant la validation fait partie du gagnant ; les modifications non commitées, non. Un agent de revue lancé dans `validate` ne doit donc pas commiter : voir [Laisser un agent de revue trancher](../compete-agents/).

## Lire le résultat

Référence API : [SpeculationResult](../../reference/speculationresult/).

Examinez les résultats des candidats avant de choisir ce que vous souhaitez conserver.

Référence API : [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) et [SpeculationResult](../../reference/speculationresult/).

## Budget et nettoyage

<!-- features -->

- **Limite de tentatives**: Chaque démarrage de candidat consomme une des `budget.attempts`. Une fois atteinte, aucun nouveau candidat ne démarre ; ceux en cours terminent.
- **Limite de tokens**: Une fois `budget.usage` atteint, tous les candidats en cours sont annulés.
- **Gagnant**: Les candidats en cours sont annulés et ceux en attente sont ignorés.

Les tokens consommés dans `validate`, par exemple par un agent de revue, ne comptent pas dans `budget`. Les candidats en cours peuvent dépasser la limite de tokens avant que leur usage soit remonté. [Budgets](../budgets/) explique comment les limites sont mesurées.

Chaque sandbox est libérée à la fin de son candidat. Si elle ne se ferme pas dans le délai `cleanupMs`, le candidat indique `cleanup: "pending"`, avec son `resourceId` dans une course durable. Une course durable dont un nettoyage reste en attente reste possédée : appelez `recoverSpeculation()` avant le prochain `speculate()`.

## Ce qui est conservé

Les branches des candidats restent toujours dans votre dépôt, gagnant comme perdants.

Un worktree n’est supprimé que s’il est propre. Un worktree contenant des fichiers non commités, non suivis ou ignorés, comme `node_modules`, reste sous `.outpost/workspaces`, et son chemin figure dans le `retainedDirectory` du candidat. Le worktree d’un candidat en échec est conservé lui aussi, et les courses durables conservent le worktree de chaque candidat. [Rétention et nettoyage](../retention/) montre comment les supprimer.

## Vérifier l’intégration avant de fusionner

`result.integration` indique si le gagnant se fusionne dans le `HEAD` de votre checkout, calculé avec `git merge-tree` sans toucher à vos fichiers ni à l’index.

Référence API : [SpeculationIntegration](../../reference/speculationintegration/).

Votre checkout peut changer après la course. Vérifiez à nouveau juste avant de fusionner :

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export async function canMerge(branch: string, commit?: string) {
  const check = await checkSpeculationIntegration(repository, branch, commit);
  return check.status === "clean";
}
```

Passez `winner.branch` et `winner.commit`. Une branche déplacée depuis la validation donne `blocked`. La vérification ne fusionne jamais : lancez `git merge` vous-même.

## Reprendre après un arrêt brutal

Passez `durability` à `speculate()`. Tentatives, usage, sorties et ressources allouées sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être relancée.

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
  runId: "parser-race",
  version: "1",
};
```

Changez `version` quand vous modifiez les agents ou `validate`. Une course enregistrée dont les briefs, le budget, le fournisseur ou la `version` diffèrent est refusée : relancez-la sous un nouveau `runId`.

Une course durable exige un fournisseur capable de retrouver et d’arrêter ses sandboxes après un arrêt brutal. Docker et Podman dans leur mode monté par défaut en sont capables ; les autres fournisseurs sont refusés, sauf si vous [implémentez la récupération](../custom-sandbox-providers/).

### Récupérer après un arrêt brutal

Une course interrompue par un arrêt brutal reste détenue par son coordinateur, le processus qui a lancé `speculate()`. Libérez-la avant de la rejouer.

<!-- canvas -->

- **Arrêter**: Terminer l’ancien coordinateur.
  - Étapes
  - **Arrêter le processus**: Un délai écoulé ou un PID absent ne prouve pas qu’il est arrêté.
    - host
  - → **Inspecter**: puis
- **Inspecter**: Lire la course enregistrée.
  - Étapes
  - **Lire l’état enregistré**: Gardez sa `revision` ; le contenu liste le `resourceId` de chaque candidat.
    - `transporter.read()`
  - → **Libérer**: puis
- **Libérer**: Abandonner l’ancienne propriété.
  - Étapes
  - **Récupérer**: Échoue si la révision a changé depuis votre lecture ; ne supprime rien.
    - `recoverSpeculation()`
  - → **Rejouer**: puis
- **Rejouer**: Relancer la course.
  - Étapes
  - **Autoriser le rejeu**: Mêmes options, avec `resume: "retry-incomplete"` dans `durability`.
    - `speculate()`
  - **Réconcilier**: Les sandboxes enregistrées sont arrêtées ; les candidats interrompus repartent sur une nouvelle branche.
    - sandbox

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport, recoverSpeculation } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const runId = "parser-race";
const key = `speculations/${createHash("sha256").update(runId).digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  await recoverSpeculation({
    transporter,
    runId,
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

Un candidat interrompu repart comme une nouvelle tentative, sur `…/<key>/2`, depuis le commit d’origine. Son ancienne branche et son ancien worktree figurent dans `result.previousAttempts`. Les candidats validés avant le arrêt brutal gardent leur issue.

## Reprendre après un quota

Une course durable terminée avec le statut `quota` n’est pas définitive. Rappeler `speculate()` avec la même `durability` relance uniquement les candidats arrêtés par une limite d’usage ou de débit, comme nouvelles tentatives. `result.quota.resetAt` donne l’heure de réinitialisation quand l’agent la communique ; [Pauses sur quota](../quota-pauses/) explique comment l’attendre.

## Limites

- `speculate()` ne fusionne jamais, ne pousse rien et n’ouvre aucune pull request.
- Une intégration `clean` n’est pas un verrou : toute modification ultérieure de votre checkout la rend obsolète.
- `cleanupMs` borne l’attente, pas le fournisseur : une sandbox `pending` peut encore tourner jusqu’à sa réconciliation.
- La récupération reprend la course, pas un processus d’agent interrompu. Un candidat rejoué peut répéter des effets externes.
- Une course durable a besoin de ses worktrees sur disque : un transport distant enregistre l’état, pas le checkout.
- Les résultats durables doivent contenir des valeurs JSON, et un arrêt brutal en cours d’exécution rend l’usage incomplet : ajoutez `budget.attempts` aux limites de tokens.

API : [speculate](../../reference/speculate/) · [SpeculationOptions](../../reference/speculationoptions/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculationDurability](../../reference/speculationdurability/) · [recoverSpeculation](../../reference/recoverspeculation/).
