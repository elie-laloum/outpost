# Lot 08 — Utiliser YAML

Le premier YAML est convaincant. La suite additionne des fragments et des formats plutôt qu’un fichier que le lecteur peut faire évoluer et valider à chaque étape.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Votre première recette YAML — P3

[Français](../../src/content/docs/fr/guide/yaml-recipes.md) · [English](../../src/content/docs/guide/yaml-recipes.md)

**Sections à reprendre :** Valider, lancer et examiner.

**Constat.** Tutoriel bien centré, deux fichiers et résultat explicite. Les quatre paragraphes de migration à la fin font doublon avec les liens Adapter.

**Action proposée.** Conserver ; enlever les renvois visibles redondants tout en préservant les ancres. Ajouter un exemple court du champ de rapport à lire.

**Plan examiné :** Relire un README depuis YAML · Déclarer les deux étapes · Choisir le dépôt et l’agent · Valider, lancer et examiner · Adapter la recette.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 111 lignes EN / 111 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer l’exécution d’une recette — P2

[Français](../../src/content/docs/fr/guide/recipe-configuration.md) · [English](../../src/content/docs/guide/recipe-configuration.md)

**Sections à reprendre :** Configurer / Composer les composants.

**Constat.** Le passage configuration 1 → 2 → 3 et les fragments provider/profil/workspace rendent difficile de reconstituer le fichier réel. Aucun exemple final assemblé.

**Action proposée.** Garder un fichier de base complet et des variantes remplaçables ; expliquer les deux versions de format dans un tableau court puis lier les variantes fichiers et harness.

**Plan examiné :** Configurer l’exécution une fois · Activer les suggestions de l’éditeur · Composer les composants natifs de configuration · Workspaces de fichiers · Pour aller plus loin.

**Repères :** 7 fichiers nommés dans les extraits, variantes comprises ; 133 lignes EN / 133 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer une boucle d’agent en YAML — P2

[Français](../../src/content/docs/fr/guide/recipe-harness.md) · [English](../../src/content/docs/guide/recipe-harness.md)

**Sections à reprendre :** Exécuter le harness / Résultat structuré.

**Constat.** La page ajoute modèle/outils puis passe à une recette format 3 ; le YAML dépend de champs du fichier précédent. Le titre promet une boucle mais le résultat attendu porte surtout sur un contrat JSON.

**Action proposée.** Montrer un outpost.yaml complet ou un diff précis ; vérifier et afficher une réponse structurée avant de présenter repairs.

**Plan examiné :** Exécuter le harness Outpost depuis le YAML · Demander un résultat structuré.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 64 lignes EN / 64 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Suivre l’exécution d’une recette — P2

[Français](../../src/content/docs/fr/guide/recipe-observation.md) · [English](../../src/content/docs/guide/recipe-observation.md)

**Sections à reprendre :** Déclarer les rapports et la télémétrie.

**Constat.** Le premier bloc est utile. Le second introduit extensions tracer/meter et handlers sans leur déclaration. Le dernier paragraphe répète silence/JSON tout en accumulant propriété, scopes et erreurs.

**Action proposée.** Garder afficher événements et rapport avec sortie attendue ; déplacer OpenTelemetry vers une variante complète liée, traduire sink/scope quand ces termes ne servent pas la configuration.

**Plan examiné :** Déclarer l’observation et les rapports finaux · Déclarer les rapports et la télémétrie.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 47 lignes EN / 47 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Composer des workflows YAML — P2

[Français](../../src/content/docs/fr/guide/recipe-workflows.md) · [English](../../src/content/docs/guide/recipe-workflows.md)

**Sections à reprendre :** Transmettre des valeurs / Réutiliser le résultat.

**Constat.** Le cas le plus naturel après la première recette, résumer steps.review.text, est relégué à la fin. Avant lui : grammaire d’expressions, tous opérateurs, contrats, callbacks, boucle et décision.

**Action proposée.** Commencer par transmettre le résultat précédent ; isoler données/conditions, puis callbacks/boucles. Garder la grammaire exhaustive dans une référence de contrat liée.

**Plan examiné :** Transmettre des valeurs structurées · Choisir une condition · Réutiliser les contrats TypeScript · Déclarer des actions locales · Exécuter l’exemple hors ligne · Réutiliser le résultat d’une étape.

**Repères :** 7 fichiers nommés dans les extraits, variantes comprises ; 118 lignes EN / 118 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Recettes YAML durables — P2

[Français](../../src/content/docs/fr/guide/recipe-durability.md) · [English](../../src/content/docs/guide/recipe-durability.md)

**Sections à reprendre :** Inspecter et reprendre / Transmettre décisions et réponses.

**Constat.** Le chemin terminal sans fichier JSON est expliqué après la soumission manuelle avancée. Beaucoup de garanties internes avant une véritable pause/reprise reproduisible.

**Action proposée.** Commencer par un dialogue terminal ou une approbation complète ; fournir statut puis reprise attendus. Séparer API headless, récupération après crash et artefacts.

**Plan examiné :** Configurer le stockage persistant · Inspecter et reprendre · Transmettre décisions et réponses · Répondre directement dans le terminal · Conserver artefacts, caches et consommation · Workspaces de fichiers.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 119 lignes EN / 119 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Jobs et services de recettes — P2

[Français](../../src/content/docs/fr/guide/recipe-services.md) · [English](../../src/content/docs/guide/recipe-services.md)

**Sections à reprendre :** Publier sur cron ou webhook / Attendre un job.

**Constat.** Une page couvre quatre programmes à exploiter et de nombreux fragments de configuration, sans fichier final ni vérification simple du résultat worker.

**Action proposée.** Garder un worker SQLite exécutable ; faire deux procédures cron et webhook qui réutilisent ses fichiers. Renvoyer queued vers le workflow appelant.

**Plan examiné :** Déclarer une file et un job de recette · Démarrer un worker explicitement · Publier sur cron ou webhook authentifié · Attendre un job depuis une recette · Workspaces de fichiers.

**Repères :** 6 fichiers nommés dans les extraits, variantes comprises ; 119 lignes EN / 119 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Utiliser du code local dans une recette — P2

[Français](../../src/content/docs/fr/guide/recipe-extensions.md) · [English](../../src/content/docs/guide/recipe-extensions.md)

**Sections à reprendre :** Réutiliser des objets observateurs / Brancher callbacks.

**Constat.** La page commence par une abstraction d’observateur emprunté et de factory ; elle ne fournit ni sink.ts ni fonction before. Les « sept lots » sont une trace d’implémentation sans sens pour le lecteur.

**Action proposée.** Commencer par une transformation locale complète avec son module ; retirer les lots internes, déplacer l’utilisation TypeScript de defineRecipe dans une procédure dédiée.

**Plan examiné :** Réutiliser des objets observateurs locaux · Brancher des callbacks typés locaux · Utiliser le moteur en TypeScript.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 80 lignes EN / 80 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Comparer et intégrer les résultats des recettes — P2

[Français](../../src/content/docs/fr/guide/recipe-advanced.md) · [English](../../src/content/docs/guide/recipe-advanced.md)

**Sections à reprendre :** Introduction / Résoudre les conflits.

**Constat.** L’introduction décrit la parité d’implémentation, puis mélange compétition et résolution de conflits. Renvois extensions vers yaml-recipes et résolution vers workspaces trop généraux.

**Action proposée.** Deux tâches distinctes, avec fichiers complets ; utiliser recipe-extensions et integrating-changes, garder la mention non publié et donner le prérequis de version locale.

**Plan examiné :** Partager une sélection de candidats · Résoudre les conflits d’intégration.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 76 lignes EN / 76 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Trouver et partager des recettes — P2

[Français](../../src/content/docs/fr/guide/sharing-recipes.md) · [English](../../src/content/docs/guide/sharing-recipes.md)

**Sections à reprendre :** Contribuer et tester une recette.

**Constat.** Télécharger une recette et contribuer au catalogue officiel sont deux audiences. Le format catalogue et les trois notions de version surchargent le second objectif.

**Action proposée.** Conserver trouver/télécharger/examiner ; séparer publier un catalogue et contribuer au dépôt. Ne pas déplacer les avertissements intégrité/authenticité.

**Plan examiné :** Trouver et télécharger des recettes · Contribuer et tester une recette.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 39 lignes EN / 39 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Composants YAML disponibles — P2

[Français](../../src/content/docs/fr/guide/yaml-components.md) · [English](../../src/content/docs/guide/yaml-components.md)

**Sections à reprendre :** Tableau des composants.

**Constat.** Plus de cent lignes générées sans regroupement par tâche ; de nombreux contrats renvoient tous à Configuration YAML, qui ne documente pas chaque champ. Le statut « implémenté » partout aide peu.

**Action proposée.** Regrouper par famille, lier directement les contrats manquants et proposer recherche/ancrages. Garder ce catalogue clairement identifié comme aide de référence dans Guide, selon les deux espaces imposés.

**Plan examiné :** .

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 117 lignes EN / 117 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Commandes de recettes — P2

[Français](../../src/content/docs/fr/guide/recipe-cli.md) · [English](../../src/content/docs/guide/recipe-cli.md)

**Sections à reprendre :** run / status, resume, answer et decide.

**Constat.** Bonne séparation des commandes, mais options mêlées entre tableau et prose ; --run-id absent du tableau run et --input décrit uniquement la version 2 malgré le JSON de format 3.

**Action proposée.** Rendre les options exhaustives et cohérentes par commande, donner un exemple JSON minimal answer/decision, conserver les procédures dans les guides associés.

**Plan examiné :** `outpost recipe run` · `outpost recipe status`, `resume`, `answer` et `decide` · `outpost recipe enqueue` et `serve` · `outpost recipe init` · `outpost recipe validate` · `outpost recipe list` et `outpost recipe fetch`.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 102 lignes EN / 102 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
