# Lot 03 — Gérer les fichiers

Les distinctions Git/fichiers/copie/montage sont nécessaires. Les nouvelles pages fichiers restent écrites avec le vocabulaire de leur implémentation, et la reprise ne se termine pas par une restauration exécutable.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Choisir les fichiers de travail — P2

[Français](../../src/content/docs/fr/guide/workspaces.md) · [English](../../src/content/docs/guide/workspaces.md)

**Sections à reprendre :** Choisir une source.

**Constat.** Bon choix initial. Les termes defaults, wrapper et caller réapparaissent ; quatre paragraphes visibles « Cette partie se trouve désormais » répètent les liens de suite.

**Action proposée.** Garder la table ; expliquer propriétaire/emprunt en français et conserver les ancres sans transformer le bas de page en historique de migration.

**Plan examiné :** Choisir une source · Séparer workspace et sandbox · Pour continuer.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 62 lignes EN / 62 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Choisir un dépôt et une branche — P2

[Français](../../src/content/docs/fr/guide/git-workspaces.md) · [English](../../src/content/docs/guide/git-workspaces.md)

**Sections à reprendre :** Choisir la stratégie de branche.

**Constat.** La section promet un choix mais renvoie presque immédiatement à BranchPolicy. Aucun mini-exemple ne montre la différence named/current/integrate à cet endroit.

**Action proposée.** Ajouter un choix orienté résultat avec les trois effets, puis garder l’API pour les options ; séparer la copie des fichiers ignorés de la décision de branche.

**Plan examiné :** Choisir le dépôt de travail · Choisir la stratégie de branche · Réutiliser un workspace pour plusieurs sandboxes · Copier des fichiers ignorés dans le worktree · Récupérer le travail conservé · Limites · Pour continuer.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 84 lignes EN / 84 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Vérifier puis intégrer une branche — P2

[Français](../../src/content/docs/fr/guide/integrating-changes.md) · [English](../../src/content/docs/guide/integrating-changes.md)

**Sections à reprendre :** Résoudre les conflits de fusion avec un agent.

**Constat.** La première vérification est lisible, mais la seconde moitié devient un manuel de résolution de conflits, sécurité, comptabilité et délais.

**Action proposée.** Extraire « Résoudre un conflit » ; garder ici tests, guard et intégration. Déplacer valeurs par défaut et inventaire des preuves de tests vers les contrats/règles concernés.

**Plan examiné :** Conditionner l’intégration à une vérification · Refuser les changements commités indésirables · Résoudre les conflits de fusion avec un agent.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 115 lignes EN / 115 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter sans dépôt Git — P2

[Français](../../src/content/docs/fr/guide/working-with-files.md) · [English](../../src/content/docs/guide/working-with-files.md)

**Sections à reprendre :** Exécuter une commande dans un workspace éphémère.

**Constat.** L’exemple produit un fichier sans afficher workspace.directory : le lecteur doit retrouver une racine générée. Le français annonce ensuite une publication « dans la section suivante », qui est désormais le montage. Nombreux termes internes dès l’introduction.

**Action proposée.** Afficher le chemin ou lire result.json ; corriger le renvoi et déplacer symlinks/aliases/versions de rapport après le premier résultat ou vers l’API. Distinguer accès à une version non publiée.

**Plan examiné :** Exécuter une commande dans un workspace éphémère · Monter une source explicitement · Vérifier l’environnement d’exécution · Pour continuer · Pour aller plus loin.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 115 lignes EN / 115 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Conserver et reprendre un workspace de fichiers — P2

[Français](../../src/content/docs/fr/guide/resuming-file-workspaces.md) · [English](../../src/content/docs/guide/resuming-file-workspaces.md)

**Sections à reprendre :** Reprendre le travail enregistré.

**Constat.** Le titre promet une reprise, mais le seul extrait ouvre un nouveau workspace portable. Aucune paire sauvegarde/reprise ne montre comment retrouver l’enregistrement puis restaurer ses fichiers.

**Action proposée.** Fournir deux scripts ou commandes, une création et une reprise, avec identifiant, stockage et fichier retrouvé ; conserver la récupération explicite en variante.

**Plan examiné :** Choisir ce qui sera conservé · Reprendre le travail enregistré · Récupérer après une interruption.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 48 lignes EN / 48 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Publier les fichiers produits — P2

[Français](../../src/content/docs/fr/guide/publishing-files.md) · [English](../../src/content/docs/guide/publishing-files.md)

**Sections à reprendre :** Copier puis restituer un dossier.

**Constat.** Le résultat est concret et les avertissements utiles. deleteMissing: true introduit pourtant la suppression dans le tout premier exemple, qui n’a besoin que de produire un inventaire.

**Action proposée.** Commencer sans suppression ; montrer deleteMissing dans une variante avec avant/après. Alléger le récit interne de staging/quarantaine sans perdre les limites de rollback.

**Plan examiné :** Copier puis restituer un dossier · Récupérer une publication interrompue.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 106 lignes EN / 106 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Travailler sur plusieurs dépôts — P2

[Français](../../src/content/docs/fr/guide/multiple-repositories.md) · [English](../../src/content/docs/guide/multiple-repositories.md)

**Sections à reprendre :** Une tâche par dépôt.

**Constat.** Le comportement d’échec est bien exposé, mais l’exemple oblige à deviner l’arborescence des deux dépôts et passe ensuite à une seconde tâche de renommage.

**Action proposée.** Afficher le petit arbre des chemins et une commande de lancement ; garder une seule histoire de bout en bout, puis le scénario complet avec approbation en lien.

**Plan examiné :** Une tâche par dépôt · Transmettre le résultat d’un dépôt à un autre · Quand un dépôt échoue · Attendre un accord avant de publier · Limites.

**Repères :** 5 fichiers nommés dans les extraits, variantes comprises ; 136 lignes EN / 136 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Comment les changements distants reviennent dans le dépôt — P2

[Français](../../src/content/docs/fr/guide/remote-synchronization.md) · [English](../../src/content/docs/guide/remote-synchronization.md)

**Sections à reprendre :** Accès au dépôt.

**Constat.** Le canvas et le tableau de récupération expliquent bien le retour. « Les deux providers » est ambigu hors du contexte cloud ; les fixtures de validation coupent l’explication.

**Action proposée.** Nommer Vercel/Daytona lorsque c’est le cas, distinguer synchronisation et fusion, et déplacer la précision de validation hors du parcours principal.

**Plan examiné :** Accès au dépôt · Choisir la branche · Envoyer des fichiers absents de Git · Quand la synchronisation s’arrête.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 59 lignes EN / 59 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
