---
title: "Contexte du dépôt"
description: "Sélectionner le checkout sur lequel l’agent travaillera."
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

Les worktrees d’exécution et verrous de propriété vivent sous `.outpost` dans le dépôt cible. Une sandbox possède un seul dépôt. Utilisez les [dépôts parallèles](../parallel-repositories/) pour composer un travail sur plusieurs checkouts.

API : [openWorkspace](../../reference/openworkspace/) · [WorkspaceOptions](../../reference/workspaceoptions/).
