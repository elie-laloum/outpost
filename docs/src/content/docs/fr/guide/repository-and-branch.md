---
title: "Dépôt et branche"
description: "Choisir le checkout que l’agent modifie, la branche où arrivent ses commits et le moment où ils rejoignent votre branche."
---

## Désigner un checkout

`repository` est un chemin quelconque dans un checkout Git local qui contient au moins un commit. Outpost travaille depuis sa racine. Sans `repository`, il utilise le répertoire courant du processus.

```ts
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
console.log(result.branch, result.commits.length);
```

Le script affiche `outpost/update-deps` et le nombre de commits. Un chemin relatif se résout depuis le répertoire courant : le résoudre depuis `import.meta.dirname` permet de lancer le script de n’importe où.

## Choisir où arrivent les commits

`branch` fixe la politique. Sans elle, les providers locaux utilisent `current` et les [sandboxes cloud](../cloud-sandboxes/) `integrate`.

| Mode        | L’agent travaille sur              | Worktree                                         | Après une tâche réussie                      | À utiliser pour                            |
| ----------- | ---------------------------------- | ------------------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| `current`   | Votre branche courante             | Aucun : votre checkout, tel quel                 | Les commits sont déjà sur votre branche      | Des tâches locales rapides que vous suivez |
| `named`     | La branche `name`                  | `.outpost/workspaces/`, supprimé s’il est propre | La branche reste pour la revue               | Relire avant de fusionner                  |
| `integrate` | Une branche temporaire `outpost/…` | `.outpost/workspaces/`, supprimé s’il est propre | Fusionnée dans votre branche, puis supprimée | Des changements livrés sans surveillance   |

`from` fixe la révision de départ d’une nouvelle branche `named` ou `integrate` ; par défaut, `HEAD`. Une branche `named` existante repart de son propre sommet. `result.branch` contient le nom de la branche.

## Conditionner l’intégration à une vérification

`dispatch()` et `workspace.dispatch()` fusionnent une branche `integrate` dès que l’agent réussit. Pour lancer d’abord votre propre vérification, ouvrez le workspace vous-même et travaillez dans une [session de sandbox](../sandbox-sessions/).

```ts
import { openWorkspace } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  const sandbox = await workspace.sandbox({ sandboxProvider, agent: coder });
  try {
    await sandbox.dispatch({
      brief: { text: "Fix the failing tests and commit the fix." },
    });
    const check = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
  } finally {
    await sandbox.close();
  }
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

`sandbox.dispatch()` ne fusionne jamais : la fusion n’a lieu que si `npm test` réussit. Sinon, la branche non fusionnée reste dans votre dépôt sous `workspace.branch`. `integrate()` ne fait rien dans les autres modes.

## Réutiliser un workspace pour plusieurs sandboxes

Un workspace ouvert possède le dépôt, la branche et les fichiers copiés. `workspace.dispatch()` et `workspace.sandbox()` démarrent à chaque appel une nouvelle sandbox sur ce workspace : deux agents peuvent ainsi travailler à tour de rôle sur la même branche. Passer `workspace` à [`createSandbox()`](../../reference/createsandbox/) ou à `dispatch()` revient au même.

Un workspace sert une seule sandbox à la fois. Fermez la sandbox avant le workspace : [Fonctionnement d’Outpost](../how-it-works/) indique qui ferme quoi.

## Copier des fichiers ignorés dans le worktree

Un nouveau worktree ne contient que les fichiers commités. `copies` liste des fichiers ou dossiers, relatifs au dépôt, à copier depuis votre checkout, par exemple une configuration de test ignorée par Git.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
console.log(result.retainedDirectory);
```

Les entrées absentes sont ignorées. Les sandboxes cloud reçoivent les commits et les `copies` ; `includeUncommitted: true` envoie aussi les fichiers non commités du worktree ([Sandboxes cloud](../cloud-sandboxes/)). Sans cette option, une copie qu’aucun `.gitignore` commité n’exclut fait échouer la première synchronisation avec le code `workspace`.

## Récupérer le travail conservé

La fermeture conserve le worktree s’il contient des fichiers non commités, non suivis ou ignorés, ou un `HEAD` détaché. Son chemin revient dans `retainedDirectory`. Ici, le `.env.test` copié suffit à le conserver.

`close({ preserve: true })` le conserve volontairement. Inspectez le travail conservé avec [Récupérer du travail](../recovery/) et élaguez-le avec [Rétention et nettoyage](../retention/).

## Limites

- L’intégration est un `git merge` local dans votre checkout. Outpost ne pousse jamais : publiez depuis votre propre processus de livraison.
- `integrate` exige une branche extraite, pas un `HEAD` détaché, et échoue avec `conflict` si vous changez de branche avant la fusion.
- Une fusion arrêtée par un conflit échoue avec `conflict` ; résolvez-la ou annulez-la dans votre checkout. La branche de travail reste.
- Une deuxième tâche sur le même checkout (`current`) ou la même branche échoue avec `conflict` au lieu d’attendre. Donnez à chaque tâche parallèle sa propre branche.
- Une branche `named` extraite dans votre propre checkout échoue avec `conflict`.
- `copies` exige `named` ou `integrate`, et les sandboxes cloud refusent `current`.
- Une sandbox travaille sur un seul dépôt : voir [Plusieurs dépôts](../multiple-repositories/).

API : [dispatch](../../reference/dispatch/) · [openWorkspace](../../reference/openworkspace/) · [BranchPolicy](../../reference/branchpolicy/) · [WorkspaceOptions](../../reference/workspaceoptions/) · [Workspace](../../reference/workspace/).
