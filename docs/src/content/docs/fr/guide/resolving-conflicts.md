---
title: "Résoudre un conflit d’intégration"
description: "Résolvez et vérifiez une fusion dans un workspace séparé."
---

Partez de [Vérifier puis intégrer une branche](../integrating-changes/) et de sa configuration. Résolvez et vérifiez une fusion dans un workspace séparé.

## Résoudre les conflits de fusion avec un agent

Activez `onConflict` pour intégrer une branche de fonctionnalité existante via une branche dédiée à la résolution. Fermez toute sandbox du workspace source avant l’appel. `branch.from` choisit le commit à intégrer ; le checkout hôte porte la branche cible. Une fusion sans conflit Git n’exécute ni l’agent ni la commande de vérification.

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.ts";
import { openWorkspace } from "@elie-laloum/outpost";
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

Avant intégration, Outpost vérifie que les deux branches d’origine pointent toujours sur les commits figés, que le checkout hôte est propre et que la résolution contient les deux commits. Le `guard` du workspace source est revérifié sur le diff final de résolution. Outpost avance la branche hôte jusqu’au commit exact vérifié sous le verrou d’intégration. Il ne pousse jamais.

En cas d’échec, d’annulation ou de dépassement du délai, le mécanisme de résolution ne déplace pas les branches d’origine. Les worktrees source et de résolution restent disponibles ; `recoveryDetails(error)` identifie la branche et le dossier de résolution et comprend `sourceBranch` et `sourceDirectory`. Inspectez-les avant de réessayer. Les métadonnées Git montées sont accessibles en écriture à l’agent : ces contrôles sont des garanties d’intégration pour du code coopératif, pas une frontière de sécurité adversariale.

Le résultat optionnel `resolution` contient le commit vérifié, la sortie de commande et l’usage de l’agent de résolution. Ajoutez cet usage à votre comptabilité de workflow : il est séparé de celui de la tâche initiale. Un worktree propre après réussite peut être supprimé ; sa branche et la conversation capturée restent. Le délai total vaut dix minutes par défaut, et celui de vérification cinq minutes à l’intérieur du total. La stratégie effectue un dispatch sans boucle automatique de réparation.

Un [`ConflictResolver`](../../reference/conflictresolver/) personnalisé reçoit le même workspace séparé, doit renvoyer un résultat commité et vérifié et fermer sa sandbox. Un hôte sale, une branche hôte changée ou un refus du garde-fou de diff ne le déclenchent pas. Les tests déterministes Git, distant simulé et Docker réel en modes monté et isolé couvrent la stratégie ; la validation réelle des agents CLI et du cloud reste à effectuer.

API : [createAgentConflictResolver](../../reference/createagentconflictresolver/) · [IntegrationOptions](../../reference/integrationoptions/) · [ConflictResolution](../../reference/conflictresolution/).
