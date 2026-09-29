---
title: "Candidats concurrents"
description: "Lancer plusieurs agents ou approches sur la même tâche, chacun sur sa branche, et garder le premier résultat qui passe vos contrôles."
---

## Mettre des candidats en concurrence

:::caution[Expérimental]
`speculate()` est expérimental : ses options et son résultat peuvent encore changer. Il sélectionne une branche ; il ne la fusionne jamais.
:::

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates: ["minimal", "refactor"].map((key) => ({
    key,
    agent: coder,
    request: {
      brief: { text: `Fix the parser with a ${key} change. Test and commit.` },
    },
  })),
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
console.log(result.status, result.winner?.branch);
```

Chaque candidat part du commit courant du checkout, sur sa propre branche `outpost/speculation/<id>/<key>`, dans son propre worktree et sa propre sandbox. Le premier candidat accepté par `validate` gagne ; les autres s’arrêtent.

| Option        | Défaut      | Rôle                                                                               |
| ------------- | ----------- | ---------------------------------------------------------------------------------- |
| `candidates`  | Obligatoire | 1 à 8 requêtes, chacune avec une `key` unique, un `agent` et une `request`.        |
| `validate`    | Obligatoire | Renvoie `true` quand un candidat est acceptable.                                   |
| `budget`      | Obligatoire | Tentatives et tokens partagés par tous les candidats.                              |
| `concurrency` | `2`         | Candidats exécutés en même temps, de 1 à 8. Les autres attendent une place.        |
| `cleanupMs`   | `30000`     | Durée d’attente de la fermeture de chaque sandbox à la fin d’un candidat.          |
| `sandbox`     | Aucun       | Réglages de sandbox communs à tous les candidats : `hooks`, `bootstrap`, `limits`. |
| `durability`  | Aucun       | Enregistre la course pour qu’elle survive à un crash : voir plus bas.              |

Pour un scénario complet opposant Codex à Claude Code, voir la recette [Mettre des agents en concurrence](../compete-agents/).

## Valider le comportement réel

`validate` reçoit la `key` du candidat, le `result` de son dispatch et sa `sandbox`, encore ouverte. Lancez-y vos tests et renvoyez `true` seulement s’ils passent : un agent qui affirme avoir réussi ne prouve rien.

Passez `signal` à chaque commande. Il se déclenche quand un autre candidat gagne ou que la course s’arrête.

Le `commit` du gagnant est le `HEAD` lu après le retour de `validate`. Un commit créé pendant la validation fait partie du gagnant ; les modifications non commitées, non. Un agent de revue lancé dans `validate` ne doit donc pas commiter : voir [Laisser un agent de revue trancher](../compete-agents/).

## Lire le résultat

| `result.status`    | Signification                                                                   |
| ------------------ | ------------------------------------------------------------------------------- |
| `winner`           | Un candidat a réussi ; voir `result.winner`.                                    |
| `no-winner`        | Chaque candidat lancé a été rejeté ou a échoué.                                 |
| `budget-exhausted` | Le budget a arrêté la course avant ; voir `result.error`.                       |
| `quota`            | Aucun gagnant, et une limite d’usage ou de débit a arrêté au moins un candidat. |
| `aborted`          | Votre `signal` a annulé la course.                                              |

`result.candidates` liste chaque candidat avec sa `branch`, son `status`, le `result` de son dispatch et son `error` :

| Statut du candidat | Signification                                                                     |
| ------------------ | --------------------------------------------------------------------------------- |
| `winner`           | Premier à passer `validate`.                                                      |
| `rejected`         | `validate` a renvoyé `false`.                                                     |
| `failed`           | La sandbox, l’agent, `validate` ou le nettoyage a levé une erreur ; voir `error`. |
| `quota`            | Une limite d’usage ou de débit l’a arrêté ; voir `quota.resetAt`.                 |
| `cancelled`        | Arrêté par un gagnant, le budget de tokens ou votre `signal`.                     |
| `skipped`          | Jamais démarré.                                                                   |

`result.usage` contient les tentatives et les tokens décomptés du budget. `result.host.changed` indique si votre checkout a bougé pendant la course.

## Budget et nettoyage

<!-- features -->

- **Limite de tentatives**: Chaque démarrage de candidat consomme une des `budget.attempts`. Une fois atteinte, aucun nouveau candidat ne démarre ; ceux en cours terminent.
- **Limite de tokens**: Une fois `budget.usage` atteint, tous les candidats en cours sont annulés.
- **Gagnant**: Les candidats en cours sont annulés et ceux en attente sont ignorés.

Les tokens consommés dans `validate`, par exemple par un agent de revue, ne comptent pas dans `budget`. Les candidats en cours peuvent dépasser la limite de tokens avant que leur usage soit remonté. [Budgets](../budgets/) explique comment les limites sont mesurées.

Chaque sandbox est libérée à la fin de son candidat. Si elle ne se ferme pas dans le délai `cleanupMs`, le candidat indique `cleanup: "pending"` et son `resourceId`.

## Ce qui est conservé

Les branches des candidats restent toujours dans votre dépôt, gagnant comme perdants.

Un worktree n’est supprimé que s’il est propre. Un worktree contenant des fichiers non commités, non suivis ou ignorés, comme `node_modules`, reste sous `.outpost/workspaces`, et son chemin figure dans le `retainedDirectory` du candidat. Le worktree d’un candidat en échec est conservé lui aussi, et les courses durables conservent le worktree de chaque candidat. [Rétention et nettoyage](../retention/) montre comment les supprimer.

## Vérifier l’intégration avant de fusionner

`result.integration` indique si le gagnant se fusionne dans le `HEAD` de votre checkout, calculé avec `git merge-tree` sans toucher à vos fichiers ni à l’index.

| `integration.status` | Signification                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `clean`              | La branche se fusionne sans conflit.                                                              |
| `conflict`           | Les chemins en conflit sont dans `conflicts`.                                                     |
| `blocked`            | Voir `reason` : modifications non commitées, `HEAD` détaché, branche déplacée ou Git trop ancien. |

Votre checkout peut changer après la course. Vérifiez à nouveau juste avant de fusionner :

```ts
import { checkSpeculationIntegration } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

export async function canMerge(branch: string, commit?: string) {
  const check = await checkSpeculationIntegration(repository, branch, commit);
  return check.status === "clean";
}
```

Passez `winner.branch` et `winner.commit`. Une branche déplacée depuis la validation donne `blocked`. La vérification ne fusionne jamais : lancez `git merge` vous-même.

## Survivre à un crash

Passez `durability` à `speculate()`. Tentatives, usage, sorties et ressources allouées sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être relancée.

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
  runId: "parser-race",
  version: "1",
};
```

Changez `version` quand vous modifiez les agents ou `validate`. Une course enregistrée dont les briefs, le budget, le provider ou la `version` diffèrent est refusée : relancez-la sous un nouveau `runId`.

Une course durable exige un provider capable de retrouver et d’arrêter ses sandboxes après un crash. Docker et Podman dans leur mode monté par défaut en sont capables ; les autres providers sont refusés, sauf si vous [implémentez la récupération](../custom-sandbox-providers/).

### Récupérer après un crash

Une course interrompue par un crash reste détenue par son coordinateur, le processus qui a lancé `speculate()`. Libérez-la avant de la rejouer.

<!-- flow -->

1. **Arrêter**: Terminer l’ancien coordinateur.
   - **Arrêter le processus**: Un délai écoulé ou un PID absent ne prouve pas qu’il est arrêté.
     - host
2. **Inspecter**: Lire la course enregistrée.
   - **Lire l’état enregistré**: Gardez sa `revision` ; le contenu liste le `resourceId` de chaque candidat.
     - `transporter.read()`
3. **Libérer**: Abandonner l’ancienne propriété.
   - **Récupérer**: Échoue si la révision a changé depuis votre lecture ; ne supprime rien.
     - `recoverSpeculation()`
4. **Rejouer**: Relancer la course.
   - **Autoriser le rejeu**: Mêmes options, avec `resume: "retry-incomplete"` dans `durability`.
     - `speculate()`
   - **Réconcilier**: Les sandboxes enregistrées sont arrêtées ; les candidats interrompus repartent sur une nouvelle branche.
     - sandbox

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport, recoverSpeculation } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

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

Un candidat interrompu repart comme une nouvelle tentative, sur `…/<key>/2`, depuis le commit d’origine. Son ancienne branche et son ancien worktree figurent dans `result.previousAttempts`. Les candidats validés avant le crash gardent leur issue.

## Reprendre après un quota

Une course durable terminée avec le statut `quota` n’est pas définitive. Rappeler `speculate()` avec la même `durability` relance uniquement les candidats arrêtés par une limite d’usage ou de débit, comme nouvelles tentatives. `result.quota.resetAt` donne l’heure de réinitialisation quand l’agent la communique ; [Pauses sur quota](../quota-pauses/) explique comment l’attendre.

## Limites

- `speculate()` ne fusionne jamais, ne pousse rien et n’ouvre aucune pull request.
- Une intégration `clean` n’est pas un verrou : toute modification ultérieure de votre checkout la rend obsolète.
- `cleanupMs` borne l’attente, pas le provider : une sandbox `pending` peut encore tourner jusqu’à sa réconciliation.
- La récupération reprend la course, pas un processus d’agent interrompu. Un candidat rejoué peut répéter des effets externes.
- Une course durable a besoin de ses worktrees sur disque : un transport distant enregistre l’état, pas le checkout.
- Les résultats durables doivent contenir des valeurs JSON, et un crash en cours d’exécution rend l’usage incomplet : ajoutez `budget.attempts` aux limites de tokens.

API : [speculate](../../reference/speculate/) · [SpeculationOptions](../../reference/speculationoptions/) · [SpeculationResult](../../reference/speculationresult/) · [SpeculativeCandidateResult](../../reference/speculativecandidateresult/) · [SpeculativeValidation](../../reference/speculativevalidation/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/) · [SpeculationDurability](../../reference/speculationdurability/) · [recoverSpeculation](../../reference/recoverspeculation/).
