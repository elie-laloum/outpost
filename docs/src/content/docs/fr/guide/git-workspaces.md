---
title: "Choisir un dépôt et une branche"
description: "Conserver les changements de l’agent sur une branche à examiner."
---

Utilisez une branche nommée pour relire le travail de l’agent. Préparez la [configuration](../setup/), puis indiquez le dépôt cible. Une branche existante est réutilisée ; choisissez un nouveau nom pour une tâche indépendante.

## Choisir le dépôt de travail

Passez `repository` pour choisir le dépôt Git utilisé par la tâche. Vos scripts de workflow peuvent se trouver ailleurs ; calculez le chemin du dépôt à partir du dossier du script pour pouvoir le lancer depuis n’importe quel répertoire courant.

```ts
import { resolve } from "node:path";
import { dispatch } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../application"),
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/update-deps" },
  brief: { text: "Update the outdated dependencies and commit the change." },
});
console.log(result.branch, result.commits.length);
// Example output: outpost/update-deps 1
```

Le script affiche `outpost/update-deps` et le nombre de commits. Un chemin relatif se résout depuis le répertoire courant : le résoudre depuis `import.meta.dirname` permet de lancer le script de n’importe où.

## Choisir la stratégie de branche

| Résultat souhaité                  | Choix                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Relire avant de fusionner          | `branch: { mode: "named", name: "outpost/my-change" }` garde les changements à part. |
| Travailler dans le checkout actuel | `branch: { mode: "current" }` modifie directement ses fichiers.                      |
| Intégrer après réussite            | `branch: { mode: "integrate" }` travaille à part puis intègre localement.            |

Sans politique explicite, une exécution montée utilise `current` et une exécution distante `integrate`.

Gardez le travail sur une branche nommée pour examiner les commits avant de les fusionner. Choisissez l’intégration automatique si une tâche réussie doit fusionner ses commits dans votre branche de départ.

Référence API : [BranchPolicy](../../reference/branchpolicy/).

## Réutiliser un workspace pour plusieurs sandboxes

Un workspace ouvert possède le dépôt, la branche et les fichiers copiés. `workspace.dispatch()` et `workspace.sandbox()` démarrent à chaque appel une nouvelle sandbox sur ce workspace : deux agents peuvent ainsi travailler à tour de rôle sur la même branche. Passer `workspace` à [`createSandbox()`](../../reference/createsandbox/) ou à `dispatch()` revient au même.

Un workspace sert une seule sandbox à la fois. Fermez la sandbox avant le workspace : la page [Fonctionnement](../how-it-works/) indique qui ferme quoi.

## Copier des fichiers ignorés dans le worktree

Un nouveau worktree ne contient que les fichiers commités. `copies` liste des fichiers ou dossiers, relatifs au dépôt, à copier depuis votre checkout, par exemple une configuration de test ignorée par Git.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/e2e" },
  copies: [".env.test"],
  brief: { text: "Run the end-to-end tests and fix what fails." },
});
console.log(result.retainedDirectory);
// Example output: /project/.outpost/workspaces/…
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

## Pour continuer

- [Vérifier avant d’intégrer les changements](../integrating-changes/)
