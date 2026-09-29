---
title: "Dépôt et branche"
description: "Choisir le checkout sur lequel l’agent travaille et où arrivent ses modifications."
---

`repository` est le chemin d’un checkout Git local possédant un commit. Il est indépendant du dossier du workflow. Sans cette option, Outpost utilise le répertoire courant du processus.

## Résoudre un chemin stable

```ts
import { resolve } from "node:path";
import { openWorkspace } from "@elie-laloum/outpost";

const workspace = await openWorkspace({
  repository: resolve(import.meta.dirname, "../application"),
  branch: { mode: "named", name: "automation/update" },
});
try {
  console.log(workspace.directory, workspace.branch);
} finally {
  await workspace.close();
}
```

Résoudre depuis `import.meta.dirname` rend le script indépendant du dossier depuis lequel il est lancé. Remplacez `../application` par le chemin de votre checkout.

## Partager un workspace

Passez un `workspace` ouvert à `createSandbox()` ou `dispatch()` lorsque plusieurs environnements doivent utiliser le même espace Git. N’ajoutez pas de choix de dépôt ou de branche : le workspace les possède déjà. Fermez d’abord les sandboxes qui l’empruntent, puis le workspace.

## Inclure des entrées supplémentaires

`copies` liste les entrées relatives au dépôt à copier dans le workspace géré, par exemple un fichier de configuration ignoré. Pour les snapshots distants, `includeUncommitted` inclut les modifications locales non commitées. Déclarez volontairement les entrées sensibles ; les fournisseurs distants les téléversent dans l’environnement cloud choisi.

Les worktrees d’exécution et verrous de propriété vivent sous `.outpost` dans le dépôt cible. Une sandbox possède un seul dépôt. Utilisez les [dépôts parallèles](../multiple-repositories/) pour composer un travail sur plusieurs checkouts.

API : [openWorkspace](../../reference/openworkspace/) · [WorkspaceOptions](../../reference/workspaceoptions/).

## Stratégie de branches

Définissez explicitement `branch` pour que votre application dispose d’une politique de livraison prévisible.

| Mode        | Effet                                                        |
| ----------- | ------------------------------------------------------------ |
| `current`   | Travailler directement dans le checkout sélectionné.         |
| `named`     | Utiliser une branche de travail gérée identifiée par `name`. |
| `integrate` | Préparer une branche gérée pour l’intégrer à sa base.        |

`from` choisit la révision de départ pour `named` et `integrate`. Une branche nommée permet une revue sans intégration immédiate.

### Conditionner l’intégration à une commande

Possédez le workspace lorsque l’intégration doit suivre les vérifications. Insérez le travail de l’agent avant la commande de test de cet exemple.

```ts
import { openWorkspace } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  const sandbox = await workspace.sandbox({ sandboxProvider });
  try {
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

Fermez la sandbox avant l’intégration pour terminer sa synchronisation finale. Un `dispatch()` à froid avec la politique d’intégration gère lui-même cette étape ; utilisez un workspace explicite pour ajouter une vérification applicative.

### Travail conservé

Un échec d’intégration ou un workspace modifié peut laisser un `retainedDirectory`. Inspectez-le avant nettoyage. Du travail non commité ou détaché ne devient pas jetable parce que la sandbox est terminée. La [récupération après échec](../recovery/) explique comment le retrouver.

L’intégration ne pousse pas vers un dépôt distant. Gardez la publication dans votre propre processus de livraison.

API : [BranchPolicy](../../reference/branchpolicy/) · [Workspace](../../reference/workspace/).
