---
title: "Vérifier puis intégrer une branche"
description: "Exécuter les vérifications avant la fusion et conserver le travail refusé."
---

Partez d’un travail effectué sur une [branche séparée](../git-workspaces/). La sandbox doit disposer de la commande de test du projet et de ses dépendances. L’intégration modifie le dépôt local ; Outpost ne pousse rien vers un dépôt distant.

## Conditionner l’intégration à une vérification

`dispatch()` et `workspace.dispatch()` fusionnent une branche `integrate` dès que l’agent réussit. Pour lancer d’abord votre propre vérification, ouvrez le workspace vous-même et travaillez dans une [session de sandbox](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost";
import { sandboxProvider, coder } from "./outpost.config.ts";

export async function change(workspace: Workspace) {
  await using sandbox = await workspace.sandbox({
    sandboxProvider,
    agent: coder,
  });
  await sandbox.dispatch({
    brief: { text: "Fix the failing tests and commit the fix." },
  });
  const check = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  if (check.status !== 0) throw new Error(check.stderr || "Tests failed");
}
```

```ts title="integrate.ts"
import { openWorkspace } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { change } from "./change.ts";

export const workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate" },
});
try {
  await change(workspace);
  await workspace.integrate();
} finally {
  await workspace.close();
}
```

`sandbox.dispatch()` ne fusionne jamais : la fusion n’a lieu que si `npm test` réussit. Sinon, la branche non fusionnée reste dans votre dépôt sous `workspace.branch`. `integrate()` ne fait rien dans les autres modes.

## Refuser les changements commités indésirables

Définissez un `guard` sur le workspace pour refuser les chemins protégés ou un diff commité final trop volumineux, indépendamment de l’agent. Ce dispatch intègre uniquement si les deux règles passent. Un refus lève `OutpostError` avec le code `guard`, libère la sandbox et conserve la branche et le worktree pour relecture.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Fix the failing tests and commit the fix." },
  branch: { mode: "integrate" },
  guard: {
    protectedPaths: [".github/**", "migrations/**"],
    maxChangedLines: 800,
  },
});
```

Le compte additionne les lignes ajoutées et supprimées ; un total de 800 est accepté. Les renommages détectés sans changement de contenu comptent zéro ligne, mais les deux chemins sont vérifiés. Avec un seuil de lignes, les changements binaires sont refusés car Git ne peut pas compter leurs lignes. Consultez [DiffGuard](../../reference/diffguard/) pour la syntaxe des motifs et les options.

Le contrôle s’exécute après synchronisation puis sous le verrou d’intégration, avant de fusionner le commit inspecté. Il inclut les changements hérités via `branch.from`, depuis l’ancêtre commun avec la branche hôte. En mode `named`, il vérifie depuis le commit d’ouverture du workspace au fil des exécutions. `current` est refusé avant exécution. Configurez `guard` dans `openWorkspace()` si vous fournissez un workspace existant ; les agents successifs partagent sa politique.

Seul le diff commité final est contrôlé. Un fichier protégé modifié puis restauré est accepté ; les fichiers non commités sont exclus. Cela ne limite pas l’accès au système de fichiers. Une inspection échouée ou incomplète refuse aussi l’intégration.

Consultez `error.details` pour les violations et commits comparés, et `recoveryDetails(error)` pour la branche et le répertoire conservés. Fermer le workspace préserve le travail refusé, même sans `preserve: true`. Un échec ultérieur n’annule pas les intégrations précédentes.

<span id="résoudre-les-conflits-de-fusion-avec-un-agent"></span>

Pour cette étape, suivez [Résoudre un conflit d’intégration](../resolving-conflicts/).
