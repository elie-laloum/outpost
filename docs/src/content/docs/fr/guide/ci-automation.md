---
title: "Automatisation CI"
description: "Exécuter sans interaction avec accès et contrôles de livraison explicites."
---

Utilisez des identifiants API ou un jeton de compte dédié pris en charge pour les jobs sans interaction. Configurez explicitement le harness et déclarez uniquement les variables secrètes nécessaires.

## Préparer le runner

```sh
npm ci
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev --json
node review.mts
```

Cela suppose un projet de workflow commité, son lockfile, une image `outpost:dev` construite et la requête `review.mts` de [Première requête](../first-request/). Le runner nécessite Node.js 24+, un historique Git suffisant, Docker et le checkout cible. Pour le cloud, installez le SDK optionnel et fournissez les identifiants d’allocation à la place d’un moteur local.

## Faire échouer correctement le job

Levez une exception sur les commandes de validation échouées et appelez `result.unwrap()` pour les workflows. Un message console seul ne définit pas un statut de job échoué. Fixez les délais, transmettez les signaux d’annulation et fermez les ressources possédées dans `finally`.

## Livrer les changements

Utilisez une branche nommée pour la revue. Intégrez après les contrôles et validations requis, puis laissez votre processus CI existant pousser ou publier. Outpost ne pousse pas automatiquement tous les dépôts d’un workflow.

Pour lancer des exécutions depuis une planification ou un événement de dépôt sans job CI, utilisez les [déclencheurs](../triggers/).

Préservez chemins de récupération, checkpoints et références d’artefacts en cas d’échec. Ne publiez pas de fichiers d’identifiants bruts ou de transcriptions privées comme artefacts CI publics.
