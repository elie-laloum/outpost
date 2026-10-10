# Lot 04 — Composer des workflows

Bon socle pédagogique sur les dépendances. Cache, artefacts et spéculation restent des mini-catalogues ; les boucles souffrent surtout du nombre de fichiers à assembler.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Relier les tâches et leurs dépendances — P2

[Français](../../src/content/docs/fr/guide/task-dependencies.md) · [English](../../src/content/docs/guide/task-dependencies.md)

**Sections à reprendre :** Partager une sandbox.

**Constat.** Le mini-graphe hors ligne est bon. La seconde moitié ajoute trois fichiers de sandbox, le choix des types et les limitations de durabilité : on réapprend l’exécution plutôt que les dépendances.

**Action proposée.** Garder déclaration/lecture/erreurs/condition ; relier l’exemple de sandbox partagée depuis une page pratique, sans le répéter ici.

**Plan examiné :** Définir des tâches et un workflow · Lire une dépendance · Corriger les erreurs du graphe · Lire les résultats · Exécuter des tâches en parallèle · Ignorer une tâche · Afficher les dépendances · Partager une sandbox · Choisir le type de tâche · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 191 lignes EN / 191 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Vérifier le travail et réessayer — P2

[Français](../../src/content/docs/fr/guide/verification-loops.md) · [English](../../src/content/docs/guide/verification-loops.md)

**Sections à reprendre :** Coder, puis lancer une commande.

**Constat.** Le canvas est beaucoup plus clair. Un simple cycle agent/test demande néanmoins six fichiers, puis trois autres pour une relecture ; le coût de copie dépasse le modèle mental.

**Action proposée.** Conserver l’exemple hors ligne ; proposer un projet téléchargeable ou un exemple moins fragmenté, puis traiter le relecteur comme variante indépendante. Revoir la règle stricte des 20 lignes.

**Plan examiné :** Recommencer jusqu’à validation · Coder, puis lancer une commande · Faire relire par un second agent · Limites · Checkpoint et reprise.

**Repères :** 9 fichiers nommés dans les extraits, variantes comprises ; 241 lignes EN / 241 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Tâches parallèles et nouvelles tentatives — P2

[Français](../../src/content/docs/fr/guide/concurrency-and-retries.md) · [English](../../src/content/docs/guide/concurrency-and-retries.md)

**Sections à reprendre :** Relancer une tâche en échec.

**Constat.** La première démonstration fonctionne. L’exemple de relance suivant retourne « Replace with your cancellable request » et ne met pas en évidence le comportement qu’il est censé expliquer.

**Action proposée.** Réutiliser une opération déterministe qui échoue puis réussit ; regrouper délais et annulation avec un tableau de choix et renvoyer les limites entières en API.

**Plan examiné :** Exécuter des tâches en parallèle · Relancer une tâche en échec · Fixer des délais · Choisir ce qu’un échec arrête · Sauter une tâche avec une condition · Annuler une exécution · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 173 lignes EN / 173 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Tester les workflows hors ligne — P1

[Français](../../src/content/docs/fr/guide/testing-workflows.md) · [English](../../src/content/docs/guide/testing-workflows.md)

**Sections à reprendre :** Remplacer l’agent dans votre test.

**Constat.** Le texte exige un dépôt jetable et annonce que le test le supprime ; l’extrait importe repository depuis la configuration de départ et ne crée ni ne supprime ce dépôt. Les fixtures réalisent de vrais commits.

**Action proposée.** Créer réellement le dépôt temporaire et le nettoyer dans le code publié ; ne pas importer le dépôt utilisateur du tutoriel pour cet exemple.

**Plan examiné :** Remplacer l’agent dans votre test · Exercer les retries et la comptabilité · Simuler les commandes de vérification · Workspaces de fichiers.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 95 lignes EN / 95 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Limiter les tentatives et les tokens — P2

[Français](../../src/content/docs/fr/guide/budgets.md) · [English](../../src/content/docs/guide/budgets.md)

**Sections à reprendre :** Inclure l’usage des décisions.

**Constat.** La séparation des prix est utile, mais la comptabilité spécialisée des décisions arrive avant l’explication du dépassement. L’exemple principal reste abstrait et répète sa sortie.

**Action proposée.** Montrer une réussite puis un budget dépassé ; placer usages personnalisés/décisions après ces deux résultats et supprimer la duplication de sortie.

**Plan examiné :** Définir un budget de workflow · Comprendre le décompte des tentatives · Déclarer la consommation · Inclure l’usage des décisions · Comprendre les limites du budget · Gérer une consommation incomplète · Conserver les totaux entre les reprises · Fixer d’autres limites · Pour aller plus loin.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 160 lignes EN / 160 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Estimer et limiter les dépenses — P3

[Français](../../src/content/docs/fr/guide/estimating-costs.md) · [English](../../src/content/docs/guide/estimating-costs.md)

**Sections à reprendre :** Charger un catalogue public de tarifs.

**Constat.** Cette section est désormais courte et utilisable : alias, huit lignes et remplacement de l’import. La reprise et la comptabilité des dispatchs personnalisés restent plus avancées que le premier calcul.

**Action proposée.** Conserver la section catalogue ; déplacer le conseil dispatch/worker après le résultat 0,60 €, et donner un lien précis pour conserver la grille.

**Plan examiné :** Fixer les tarifs et la limite · Traiter une estimation incomplète · Charger un catalogue public de tarifs · Garder une estimation stable à la reprise.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 74 lignes EN / 74 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Réutiliser les résultats des tâches — P2

[Français](../../src/content/docs/fr/guide/task-cache.md) · [English](../../src/content/docs/guide/task-cache.md)

**Sections à reprendre :** Faire expirer ou renouveler les entrées.

**Constat.** La section ne contient qu’un lien API. Deux exemples en six fichiers, plusieurs listes de contrats et un paragraphe sur les générations settled diluent la tâche « réutiliser un résultat ».

**Action proposée.** Garder la démonstration hors ligne et le choix de clé ; montrer concrètement version/expiration, réunir les limites près des décisions concernées, extraire l’exemple de revue avancé.

**Sections sans réponse pratique :** « Faire expirer ou renouveler les entrées ». Elles ne contiennent actuellement qu’un lien API.

**Plan examiné :** Mettre une tâche en cache · Choisir la clé · Comprendre un résultat trouvé en cache · Choisir une tâche qui accepte un cache · Faire expirer ou renouveler les entrées · Suivre les événements du cache · Protéger et purger les entrées · Workspaces de fichiers · Limites.

**Repères :** 6 fichiers nommés dans les extraits, variantes comprises ; 185 lignes EN / 185 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Partager des fichiers et des rapports — P2

[Français](../../src/content/docs/fr/guide/artifacts.md) · [English](../../src/content/docs/guide/artifacts.md)

**Sections à reprendre :** Quand utiliser un artefact / Utiliser les artefacts dans un workflow.

**Constat.** Bon exemple hors ligne et avertissement sur l’intégrité. Le choix sortie/artefact arrive après le code ; publication autonome, workflow, filiation et interprocessus forment quatre parcours. Le chemin physique annoncé .outpost/storage/artifacts/<id>.blob ne correspond pas au transport local sous objects/ décrit dans storage.

**Action proposée.** Placer le choix avant le code ; garder publier/lire et isoler partage entre processus. Distinguer clé logique artifacts/<id>.blob et chemin physique du transport.

**Plan examiné :** Publier et lire un artefact · Quand utiliser un artefact · Choisir un contrat · Utiliser les artefacts dans un workflow · Enregistrer la filiation · Lire un artefact depuis un autre processus · Stocker les artefacts à distance · Limites.

**Repères :** 6 fichiers nommés dans les extraits, variantes comprises ; 193 lignes EN / 193 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter des candidats concurrents — P2

[Français](../../src/content/docs/fr/guide/speculation.md) · [English](../../src/content/docs/guide/speculation.md)

**Sections à reprendre :** Choisir le meilleur score / Budget et nettoyage.

**Constat.** La sélection, la validation, les budgets, l’intégration et la récupération durable se répètent avec les deux pages associées. Le pied de page contient même un lien vers la page courante.

**Action proposée.** Garder un premier gagnant validé ; regrouper le score avancé, renvoyer récupération et limites durables à resuming-speculation, conserver les ancres sans auto-renvoi visible.

**Plan examiné :** Mettre des candidats en concurrence · Choisir le meilleur score · Valider le comportement réel · Budget et nettoyage · Ce qui est conservé · Vérifier l’intégration avant de fusionner · Limites · Pour aller plus loin.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 163 lignes EN / 163 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Reprendre une compétition de candidats — P2

[Français](../../src/content/docs/fr/guide/resuming-speculation.md) · [English](../../src/content/docs/guide/resuming-speculation.md)

**Sections à reprendre :** Reprendre après un arrêt brutal.

**Constat.** Le premier extrait construit durability mais n’exécute pas speculate ; les instructions de récupération ne montrent pas non plus le nouvel appel complet. Le lecteur doit raccorder trois fragments et deux pages pour reprendre.

**Action proposée.** Fournir un fichier exécutable qui reprend l’exemple précédent, avec imports explicites, runId stable, commande de reprise et état attendu ; garder l’autorisation et les prérequis de récupération.

**Plan examiné :** Reprendre après un arrêt brutal · Reprendre après un quota.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 68 lignes EN / 68 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
