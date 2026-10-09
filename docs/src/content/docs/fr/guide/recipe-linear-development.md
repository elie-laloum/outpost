---
title: Développer depuis un ticket Linear
description: Vérifier un token Linear local, valider un plan et implémenter un ticket depuis la CLI des recettes.
---

Le dépôt source contient `test-recipe-linear-development/` : deux fichiers YAML, des extensions exécutées sur l’hôte et une petite application HTTP TypeScript dans `repo/`. Le workflow lit un ticket Linear, prépare un plan, demande son approbation, implémente le travail validé, exécute obligatoirement `npm test` et produit un résumé. Il utilise le [moteur de recettes durables](../recipe-durability/).

## Préparer l’application

L’application demande Node.js 24+ et aucune dépendance d’exécution. Elle expose `/health` et `/hello?name=Jean` sur le port 3000 ; `PORT` permet de choisir un autre port. Ses tests démarrent un serveur HTTP temporaire.

```sh
npm --prefix test-recipe-linear-development/repo test
npm --prefix test-recipe-linear-development/repo start
```

La recette initialise un dépôt Git indépendant dans `repo/` à la première exécution. Un dépôt existant doit déjà posséder un commit ; sa configuration Git est conservée. Les agents reçoivent uniquement ce dépôt. Le cache du token et les checkpoints restent dans le dossier parent.

## Lancer depuis la CLI

Utilisez la CLI construite depuis ce dépôt. Après compilation, créez son lien puis lancez la recette. La configuration fournie sélectionne Docker avec l’image `outpost:sandbox` et la session Codex habituelle de l’hôte. Préparez-les avec les guides [images d’agents](../agent-images/) et [authentification](../authentication/) avant l’exécution des agents.

```sh
bun run build
bun link
outpost recipe run \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml
```

L’extension hôte cherche `LINEAR_API_KEY`, puis son cache dans `test-recipe-linear-development/.private/linear-token`. À chaque lancement ou reprise, elle vérifie la clé API personnelle sélectionnée avec la [requête viewer de Linear](https://linear.app/developers/graphql). Une clé absente ou rejetée déclenche une saisie masquée dans le terminal ; seule une clé validée remplace le fichier enregistré. Une panne réseau arrête l’invocation et conserve le cache.

Le cache est un fichier en clair exclu de Git, avec les permissions `0600` pour le fichier et `0700` pour le dossier sur POSIX. La clé ne devient jamais une réponse du workflow, un paramètre de checkpoint, une variable d’agent ou un prompt. Seuls les champs sélectionnés du ticket parviennent aux agents. Utilisez une clé personnelle avec accès en lecture ; cette recette ne modifie rien dans Linear.

## Choisir et valider le travail

Saisissez un identifiant tel que `ENG-123`, un UUID, une URL de ticket Linear ou un numéro. Un numéro seul déclenche une demande de clé d’équipe. Un ticket inconnu ou inaccessible entraîne une nouvelle demande.

La CLI affiche le résultat de planification sauvegardé à l’étape d’approbation. Choisissez **Approve** avec un motif pour continuer, **Reject** pour arrêter le travail dépendant ou **Leave pending** pour examiner le plan plus tard. La consigne de planification sans modification reste une instruction à l’agent ; la gate native impose que l’implémentation ne démarre qu’après approbation. Le workspace partagé est intégré dans `repo/` uniquement après réussite du workflow complet.

L’observateur déclaré affiche sur stderr les états des tâches, leurs durées, les outils, les commits, les totaux de tokens et le résumé final. Il omet les événements bruts du protocole et les traces de checkpoints. Ajoutez `--json` pour une automatisation ou `--interactive --json` pour les questions en terminal avec un rapport final exploitable par un programme.

## Reprendre ou traiter un autre ticket

L’identifiant de run par défaut est `linear-development`. Reprenez un run existant pour retrouver sa question ou son plan sauvegardé sans rejouer les tâches terminées. Pour un autre ticket, démarrez un run avec un nouveau `--run-id` ; le cache du token validé est réutilisé.

```sh
outpost recipe resume \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml \
  --run-id linear-development
outpost recipe run \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml \
  --run-id next-issue
```

Les tests hors ligne couvrent rejet, remplacement, cache, pannes réseau et exclusion du token, ainsi que le parcours CLI complet avec Linear et modèles simulés, de vrais workspaces Git et les tests de l’application. Ils n’utilisent ni token Linear réel ni appel Codex payant.
