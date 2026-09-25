---
title: Cookbook
description: "Recettes complètes avec préparation autonome et résultat observable."
---

Choisissez le résultat à obtenir. Chaque recette part d’un dossier de démonstration neuf ; aucun chapitre préalable ni configuration cachée n’est nécessaire. Le code utilise les imports publics du package.

## Commencer simplement

- [Exécuter un workflow parallèle sans agent](./offline/) — Collectez trois vérifications indépendantes, puis assemblez un rapport après leur terminaison.
- [Corriger une régression sur sa branche](./focused-fix/) — Réparez la régression des espaces, conservez ses commits séparément et relisez avant fusion.
- [Renvoyer un rapport de défaut validé](./typed-report/) — Demandez à un agent d’examiner le projet et transformez sa réponse en données exploitables.

## Combiner les agents

- [Implémentation et revue séquentielles](sequential-review/) : commencer avec deux appels explicites.
- [Faire implémenter Codex et relire Claude](./pair-review/) — Transmettez les mêmes fichiers d’un agent à l’autre, puis vérifiez leur état final par les tests.
- [Mener des investigations indépendantes en parallèle](./parallel/) — Examinez les espaces et Unicode avec des workspaces et sandboxes séparés.
- [Intégrer uniquement après tests et revue](./delivery-gate/) — Exigez des tests, une décision de revue validée et un worktree propre avant l’intégration locale.
- [Poursuivre une investigation et comparer une alternative](./conversations/) — Conservez le contexte entre exécutions sans confondre identité de conversation et isolation Git.

## Dépasser un seul environnement

- [Récupérer du travail inachevé après un échec](./recovery/) — Laissez un fichier non commité, faites échouer un test et inspectez le workspace conservé après fermeture de la sandbox.
- [Coordonner deux dépôts](./multiple-repositories/) — Transmettez le résultat du premier dépôt à une tâche qui travaille sur un autre dépôt.
- [Exécuter la même analyse dans une sandbox cloud](./remote/) — Changez le provider d’exécution en conservant l’agent choisi et son authentification explicite.
- [Exécuter une tâche d’agent bornée en CI](./ci/) — Exécutez le même projet avec un job GitHub Actions manuel et exportez des patches à relire.

## Conserver état et décisions

- [Exiger une décision contrôlée par un humain](./human-approval/) — Persistez une demande d’approbation et transmettez une décision locale explicite.
- [Reprendre un workflow de texte sauvegardé](./checkpoints/) — Rouvrez un workflow terminé sans réexécuter ses tâches.
- [Échanger un contrat versionné](./artifacts/) — Publiez un contrat validé, puis relisez-le via une dépendance déclarée.
- [Traiter du texte via un worker durable](./workers/) — Exécutez une vraie file SQLite, un coordinateur HTTP et un worker sur loopback avant de séparer les hôtes.

Les recettes d’agents appellent réellement les modèles ; la recette distante alloue aussi des ressources cloud facturables. Les recettes hors ligne nécessitent seulement Node/npm, avec Git lorsque précisé. La préparation distingue installation initiale et exécution. Les branches nommées conservent les commits à relire ; aucune recette ne pousse automatiquement.
