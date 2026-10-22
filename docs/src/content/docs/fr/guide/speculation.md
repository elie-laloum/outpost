---
title: "Exécuter des candidats concurrents"
description: "Essayez plusieurs candidats avec une validation, des budgets et une intégration explicites."
---

## Mettre des candidats en concurrence

Utilisez `speculate()` pour lancer plusieurs candidats sur une même tâche et valider explicitement chaque résultat. Les candidats ont des branches et des sandboxes séparées ; un gagnant est choisi uniquement si votre vérification l’accepte. `speculate()` sélectionne une branche ; il ne la fusionne jamais.

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
import type { SpeculationOptions } from "@elie-laloum/outpost/speculation";

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
import { speculate } from "@elie-laloum/outpost/speculation";
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
console.log(result.status, result.terminationCode, result.winner?.branch);
// Example output: winner undefined outpost/speculation/…/codex
```

## Choisir le meilleur score

Utilisez `select: "best"` pour laisser finir tous les candidats admis. `score` s’exécute uniquement après l’acceptation par `validate`, dans la sandbox encore ouverte. Renvoyez un nombre fini : le score le plus élevé gagne après un nettoyage réussi. Les scores égaux suivent l’ordre de déclaration. Le mode par défaut `select: "first"` conserve le premier candidat accepté et annule les autres.

```ts title="best.ts"
import { speculate } from "@elie-laloum/outpost/speculation";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";

export const best = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2 },
  candidates,
  validate,
  select: "best",
  score: async ({ result }) => -result.usage.output,
});
```

Ce score favorise une consommation moindre de tokens de sortie. Vous pouvez aussi lancer des vérifications, inspecter le diff ou appeler un agent juge via `sandbox` et `signal`. Les scores figurent dans les résultats des candidats, y compris les perdants. Une exception, `NaN` ou une valeur infinie fait échouer le candidat ; une annulation ou un arrêt par budget de tokens empêche de sélectionner un meilleur résultat partiel. La limite de tentatives restreint toujours les admissions : le gagnant peut donc provenir d’un sous-ensemble des candidats.

## Valider le comportement réel

`validate` reçoit la `key` du candidat, le `result` de son dispatch et sa `sandbox`, encore ouverte. Lancez-y vos tests et renvoyez `true` seulement s’ils passent : un agent qui affirme avoir réussi ne prouve rien.

Passez `signal` à chaque commande. Il se déclenche quand un autre candidat gagne en mode first ou que la course s’arrête.

Le `commit` du gagnant est le `HEAD` lu après le retour de `validate` et de l’éventuel callback `score`. Un commit créé dans l’un ou l’autre fait partie du gagnant ; les modifications non commitées, non. Un agent de revue lancé dans `validate` ne doit donc pas commiter : voir [Laisser un agent de revue trancher](../compete-agents/).

Examinez `result.winner` et les [résultats des candidats](../../reference/speculativecandidateresult/) avant de choisir les branches à garder.

## Budget et nettoyage

<!-- features -->

- **Limite de tentatives**: Chaque démarrage de candidat consomme une des `budget.attempts`. Une fois atteinte, aucun nouveau candidat ne démarre ; ceux en cours terminent.
- **Limite de tokens**: Une fois `budget.usage` atteint, tous les candidats en cours sont annulés.
- **Premier gagnant**: En mode first, les candidats en cours sont annulés et ceux en attente sont ignorés. En mode best, la sélection attend les candidats admis.

Les tokens consommés dans `validate` ou `score`, par exemple par un agent de revue, ne comptent pas dans `budget`. Les candidats en cours peuvent dépasser la limite de tokens avant que leur usage soit remonté. [Budgets](../budgets/) explique comment les limites sont mesurées.

Chaque sandbox est libérée à la fin de son candidat. Si elle ne se ferme pas dans le délai `cleanupMs`, le candidat indique `cleanup: "pending"`, avec son `resourceId` dans une course durable. Une course durable dont un nettoyage reste en attente reste possédée : appelez `recoverSpeculation()` avant le prochain `speculate()`.

## Ce qui est conservé

Les branches des candidats restent toujours dans votre dépôt, gagnant comme perdants.

Un worktree n’est supprimé que s’il est propre. Un worktree contenant des fichiers non commités, non suivis ou ignorés, comme `node_modules`, reste sous `.outpost/workspaces`, et son chemin figure dans le `retainedDirectory` du candidat. Le worktree d’un candidat en échec est conservé lui aussi, et les courses durables conservent le worktree de chaque candidat. [Rétention et nettoyage](../retention/) montre comment les supprimer.

## Vérifier l’intégration avant de fusionner

`result.integration` indique si le gagnant se fusionne dans le `HEAD` de votre checkout, calculé avec `git merge-tree` sans toucher à vos fichiers ni à l’index.

Référence API : [SpeculationIntegration](../../reference/speculationintegration/).

Votre checkout peut changer après la course. Vérifiez à nouveau juste avant de fusionner :

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";

export async function canMerge(branch: string, commit?: string) {
  const check = await checkSpeculationIntegration(repository, branch, commit);
  return check.status === "clean";
}
```

Passez `winner.branch` et `winner.commit`. Une branche déplacée depuis la validation donne `blocked`. La vérification ne fusionne jamais : lancez `git merge` vous-même.

Lisez `result.terminationCode` pour un arrêt du coordinateur : `aborted`, `quota`, `limit` ou `usage-unavailable`. Les workflows utilisent le même vocabulaire ; `budget-exhausted` reste un statut de spéculation, dont le motif est `limit` ou une comptabilité incomplète. Un gagnant n’a pas de code de terminaison. Un résultat `no-winner` n’a pas non plus de code d’arrêt du coordinateur : consultez `candidates` pour les échecs d’exécution et les rejets de validation.

L’`id` de la course identifie son coordinateur. L’observation suit les dispatchs des candidats ; la course ne renvoie pas d’`observationId` agrégé unique.

## Reprendre après un arrêt brutal

Ajoutez la conservation de l’état avant le démarrage de la course. Elle préserve la progression ; rejouer après un arrêt brutal demande toujours une autorisation explicite.

Passez `durability` à `speculate()`. Tentatives, usage, sorties et ressources allouées sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être relancée.

```ts title="durability.ts"
import { join } from "node:path";
import { createLocalTransport } from "@elie-laloum/outpost/core";
import { type SpeculationDurability } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "parser-race",
  version: "1",
};
```

Reprenez `candidates.ts` et `validate.ts` de [la première compétition](#mettre-des-candidats-en-concurrence). Ce point d’entrée utilise le même budget à chaque appel.

```ts title="durable-race.ts"
import { speculate } from "@elie-laloum/outpost/speculation";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";
import { durability } from "./durability.ts";

const result = await speculate({
  repository,
  sandboxProvider,
  candidates,
  validate,
  budget: { attempts: 2, usage: { output: 20_000 } },
  durability: {
    ...durability,
    ...(process.argv.includes("--retry-incomplete")
      ? { resume: "retry-incomplete" as const }
      : {}),
  },
});
console.log(result.status, result.winner?.branch);
```

`node durable-race.ts` démarre la compétition ou lit son résultat déjà terminé. Après les vérifications et la récupération décrites ci-dessous, `node durable-race.ts --retry-incomplete` autorise les candidats interrompus à recommencer.

Changez `version` quand vous modifiez les agents, `validate` ou `score`. Une course enregistrée dont les briefs, le budget, le fournisseur, le mode de sélection ou la `version` diffèrent est refusée : relancez-la sous un nouveau `runId`.

Une course durable exige un fournisseur capable de retrouver et d’arrêter ses sandboxes après un arrêt brutal. Docker et Podman dans leur mode monté par défaut en sont capables ; les autres fournisseurs sont refusés, sauf si vous [implémentez la récupération](../custom-sandbox-providers/).

### Récupérer après un arrêt brutal

Une course interrompue par un arrêt brutal reste détenue par son coordinateur, le processus qui a lancé `speculate()`. Libérez-la avant de la rejouer.

1. Arrêtez l’ancien coordinateur et confirmez sa fin ; un délai dépassé ou un PID absent ne suffit pas.
2. Lisez la compétition enregistrée via le transport. Examinez les identifiants des ressources et gardez la révision actuelle.
3. Appelez `recoverSpeculation()` avec cette révision pour libérer la propriété. Une révision modifiée est refusée ; cet appel ne supprime rien.
4. Relancez la même compétition avec `durability.resume: "retry-incomplete"`. Outpost traite les sandboxes enregistrées, puis relance les candidats interrompus sur de nouvelles branches.

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport } from "@elie-laloum/outpost/core";
import { recoverSpeculation } from "@elie-laloum/outpost/speculation";
import { repository } from "./outpost.config.ts";
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const key = `speculations/${createHash("sha256").update("parser-race").digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  // Example output: {"runId":"parser-race",…}
  await recoverSpeculation({
    transporter,
    runId: "parser-race",
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

Un candidat interrompu repart comme une nouvelle tentative, sur `…/<key>/2`, depuis le commit d’origine. Son ancienne branche et son ancien worktree figurent dans `result.previousAttempts`. Les candidats validés et notés avant l’arrêt brutal gardent leurs scores enregistrés ; la sélection best attend toujours les candidats admis restants. Un arrêt brutal pendant la notation exige une nouvelle tentative explicitement autorisée.

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

<span id="lire-le-résultat"></span>

[Exécuter des candidats concurrents](../speculation/).
