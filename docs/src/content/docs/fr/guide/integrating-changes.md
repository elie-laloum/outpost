---
title: "Vérifier puis intégrer une branche"
description: "Exécuter les vérifications avant la fusion et conserver le travail refusé."
---

Partez d’un travail effectué sur une [branche séparée](../git-workspaces/). La sandbox doit disposer de la commande de test du projet et de ses dépendances. L’intégration modifie le dépôt local ; Outpost ne pousse rien vers un dépôt distant.

L’intégration acquiert le même verrou du checkout hôte qu’un workspace `current`. Si celui-ci est encore ouvert, l’intégration échoue avec le code `conflict` et conserve le worktree candidat. Fermez le workspace courant avant de retenter l’intégration.

## Conditionner l’intégration à une vérification

`dispatch()` et `workspace.dispatch()` fusionnent une branche `integrate` dès que l’agent réussit. Pour lancer d’abord votre propre vérification, ouvrez le workspace vous-même et travaillez dans une [session de sandbox](../sandbox-sessions/).

<!-- tabs -->

```ts title="change.ts"
import type { Workspace } from "@elie-laloum/outpost/workspaces";
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
import { openWorkspace } from "@elie-laloum/outpost/workspaces";
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
import { dispatch } from "@elie-laloum/outpost/core";
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

## Résoudre les conflits de fusion avec un agent

Activez `onConflict` pour intégrer une branche de fonctionnalité existante via une branche dédiée à la résolution. Fermez toute sandbox du workspace source avant l’appel. `branch.from` choisit le commit à intégrer ; le checkout hôte porte la branche cible. Une fusion sans conflit Git n’exécute ni l’agent ni la commande de vérification.

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost/workspaces";
import { coder, sandboxProvider } from "./outpost.config.ts";
import { openWorkspace } from "@elie-laloum/outpost/workspaces";
import { repository } from "./outpost.config.ts";

await using workspace = await openWorkspace({
  repository,
  branch: { mode: "integrate", from: "feature/to-integrate" },
});

const resolution = await workspace.integrate({
  onConflict: createAgentConflictResolver(coder, {
    sandboxProvider,
    verify: { executable: "npm", arguments: ["test"] },
  }),
});
```

Outpost fige les commits source et hôte, ouvre un worktree nommé séparé et prépare la fusion conflictuelle dans la sandbox du fournisseur explicite. L’agent doit la résoudre et la commiter. Outpost exécute ensuite `npm test` sur ce commit combiné, exige le statut zéro et refuse les changements non ignorés non commités ou un commit modifié pendant la vérification. Installez d’abord les dépendances de test du projet dans l’environnement choisi ; la stratégie ne les installe pas automatiquement.

Ajoutez `instructions` à `createAgentConflictResolver()` pour donner des consignes propres au projet. Elles complètent le [brief de résolution intégré décrit dans l’API](../../reference/createagentconflictresolver/#outpost-instructions), sans le remplacer.

Avant intégration, Outpost vérifie que les deux branches d’origine pointent toujours sur les commits figés, que le checkout hôte est propre et que la résolution contient les deux commits. Le `guard` du workspace source est revérifié sur le diff final de résolution. Outpost avance la branche hôte jusqu’au commit exact vérifié sous le verrou d’intégration. Il ne pousse jamais.

En cas d’échec, d’annulation ou de dépassement du délai, le mécanisme de résolution ne déplace pas les branches d’origine. Les worktrees source et de résolution restent disponibles ; `recoveryDetails(error)` identifie la branche et le dossier de résolution et comprend `sourceBranch` et `sourceDirectory`. Inspectez-les avant de réessayer. Les métadonnées Git montées sont accessibles en écriture à l’agent : ces contrôles sont des garanties d’intégration pour du code coopératif, pas une frontière de sécurité adversariale.

Le résultat optionnel `resolution` contient le commit vérifié, la sortie de commande et l’usage de l’agent de résolution. Ajoutez cet usage à votre comptabilité de workflow : il est séparé de celui de la tâche initiale. Un worktree propre après réussite peut être supprimé ; sa branche et la conversation capturée restent. Le délai total vaut dix minutes par défaut, et celui de vérification cinq minutes à l’intérieur du total. La stratégie effectue un dispatch sans boucle automatique de réparation.

Un [`ConflictResolver`](../../reference/conflictresolver/) personnalisé reçoit le même workspace séparé, doit renvoyer un résultat commité et vérifié et fermer sa sandbox. Un hôte sale, une branche hôte changée ou un refus du garde-fou de diff ne le déclenchent pas. Les tests déterministes Git, distant simulé et Docker réel en modes monté et isolé couvrent la stratégie ; la validation réelle des agents CLI et du cloud reste à effectuer.

API : [createAgentConflictResolver](../../reference/createagentconflictresolver/) · [IntegrationOptions](../../reference/integrationoptions/) · [ConflictResolution](../../reference/conflictresolution/).
