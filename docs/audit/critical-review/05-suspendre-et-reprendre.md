# Lot 05 — Suspendre et reprendre

La séparation approbation/question/quota est bonne. Il reste à séparer reprise ordinaire, récupération après crash et intégrations avancées ; leurs garanties importantes ne doivent pas disparaître.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Enregistrer et reprendre un workflow — P2

[Français](../../src/content/docs/fr/guide/durable-runs.md) · [English](../../src/content/docs/guide/durable-runs.md)

**Sections à reprendre :** Conserver l’identité du checkpoint / Récupérer une exécution après un plantage.

**Constat.** La démonstration initiale est accessible. Elle est suivie d’un inventaire d’identité, de deux reprises, du SHA de stockage et du cas des files : plusieurs objectifs dans 219 lignes.

**Action proposée.** Séparer reprise ordinaire et récupération après crash ; lier queued-workflows pour le cas worker. Garder version/runId et effets répétés, renvoyer la liste exacte d’identité à l’API.

**Plan examiné :** Enregistrer la progression · Renvoyer des sorties JSON · Conserver l’identité du checkpoint · Reprendre le travail inachevé · Récupérer une exécution après un plantage · Reprendre un workflow lancé depuis une file · Stocker les checkpoints à distance · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 219 lignes EN / 219 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Attendre une approbation — P2

[Français](../../src/content/docs/fr/guide/approvals.md) · [English](../../src/content/docs/guide/approvals.md)

**Sections à reprendre :** Ajouter une étape / Authentifier l’acteur.

**Constat.** La démo annonce honnêtement une décision simulée. Quatre fichiers avant le résultat et une authentification expliquée après le canvas compliquent toutefois le passage vers une vraie approbation.

**Action proposée.** Présenter juste avant la décision la frontière application authentifiée / contrôle actors ; fournir un projet complet et supprimer les limites de signatures sans rapport avec cette première page.

**Plan examiné :** Ajouter une étape d’approbation · Soumettre une décision · Suspendre sans approbation · Authentifier l’acteur · Approuver une exécution lancée par un job · Limites · Pour continuer.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 151 lignes EN / 151 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exiger des approbations signées — P2

[Français](../../src/content/docs/fr/guide/signed-approvals.md) · [English](../../src/content/docs/guide/signed-approvals.md)

**Sections à reprendre :** Exiger une décision signée.

**Constat.** L’introduction et le premier paragraphe répètent la même séparation des clés. Trois fichiers déclarent des fonctions mais aucun appel ne relie demande, signature et soumission.

**Action proposée.** Montrer le raccord avec la demande de approvals et un exemple de refus ; garder la rotation des clés, supprimer la répétition initiale.

**Plan examiné :** Exiger une décision signée · Renouveler les clés des approbateurs.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 73 lignes EN / 73 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Permettre à l’agent de poser des questions — P2

[Français](../../src/content/docs/fr/guide/interactive-tasks.md) · [English](../../src/content/docs/guide/interactive-tasks.md)

**Sections à reprendre :** Accepter une réponse / Écrire une tâche interactive personnalisée.

**Constat.** Comparaison question/approbation et canvas utiles. La page rassemble dialogue d’agent, authentification, reprise, tâche personnalisée et fichier settled ; le premier parcours se perd.

**Action proposée.** Garder poser/afficher/répondre et la conservation du workspace ; extraire l’interaction personnalisée et relier la reprise de fichiers à sa page dédiée.

**Plan examiné :** Choisir entre une question et une approbation · Définir le dialogue · Déroulement du dialogue · Afficher les questions · Accepter une réponse · Lire le résultat · Conserver le workspace · Reprendre après un arrêt brutal · Écrire une tâche interactive personnalisée · Workspaces de fichiers · Limites.

**Repères :** 5 fichiers nommés dans les extraits, variantes comprises ; 213 lignes EN / 213 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Faire une pause quand un quota est atteint — P2

[Français](../../src/content/docs/fr/guide/quota-pauses.md) · [English](../../src/content/docs/guide/quota-pauses.md)

**Sections à reprendre :** Reconnaître une erreur de quota / Transmettre la conversation à un traitement en file.

**Constat.** L’essai hors ligne et le schéma attente/pause sont bons. La table des signaux natifs, la matrice des types de tâches et les deux intégrations avancées reconstituent un catalogue de contrats.

**Action proposée.** Garder attendre/revenir et les conséquences sur la conversation ; déplacer les signaux exacts vers l’API ou les pages agents et renvoyer files/compétitions aux parcours correspondants.

**Plan examiné :** Mettre en pause au lieu d’échouer · Reconnaître une erreur de quota · Ce qui se passe après une erreur de quota · Poursuivre la conversation interrompue · Transmettre la conversation à un traitement en file · Suspendre une course après une erreur de quota · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 177 lignes EN / 177 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
