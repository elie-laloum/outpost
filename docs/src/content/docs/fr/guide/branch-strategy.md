---
title: "Stratégie de branches"
description: "Décider où vont les changements et quand les intégrer."
---

Définissez explicitement `branch` pour que votre application dispose d’une politique de livraison prévisible.

| Mode        | Effet                                                        |
| ----------- | ------------------------------------------------------------ |
| `current`   | Travailler directement dans le checkout sélectionné.         |
| `named`     | Utiliser une branche de travail gérée identifiée par `name`. |
| `integrate` | Préparer une branche gérée pour l’intégrer à sa base.        |

`from` choisit la révision de départ pour `named` et `integrate`. Une branche nommée permet une revue sans intégration immédiate.

## Conditionner l’intégration à une commande

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

## Travail conservé

Un échec d’intégration ou un workspace modifié peut laisser un `retainedDirectory`. Inspectez-le avant nettoyage. Du travail non commité ou détaché ne devient pas jetable parce que la sandbox est terminée. La [récupération après échec](../failure-recovery/) explique comment le retrouver.

L’intégration ne pousse pas vers un dépôt distant. Gardez la publication dans votre propre processus de livraison.

API : [BranchPolicy](../../reference/branchpolicy/) · [Workspace](../../reference/workspace/).
