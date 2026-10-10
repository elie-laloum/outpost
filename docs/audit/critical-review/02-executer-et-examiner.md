# Lot 02 — Exécuter et examiner

Les tâches sont reconnaissables, mais les exemples de rapport et de lecture de journal doivent garantir ce que leur titre promet. Réduire les mécanismes de protocole au profit des résultats observables.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Rédiger les consignes de l’agent — P2

[Français](../../src/content/docs/fr/guide/briefs.md) · [English](../../src/content/docs/guide/briefs.md)

**Sections à reprendre :** Insérer la sortie d’une commande.

**Constat.** Page utile mais trois objectifs : modèle Markdown, expansion shell et contrôle des résultats. Syntaxe, limites et sécurité prennent le pas sur un premier brief.

**Action proposée.** Garder texte/fichier et un exemple ; isoler visuellement l’expansion avancée et placer son avertissement avant le premier modèle exécutable.

**Plan examiné :** Envoyer du texte ou un fichier · Utiliser un modèle avec des variables · Insérer la sortie d’une commande · Demander à l’agent, contrôler dans le code · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 122 lignes EN / 122 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Réutiliser une sandbox — P2

[Français](../../src/content/docs/fr/guide/sandbox-sessions.md) · [English](../../src/content/docs/guide/sandbox-sessions.md)

**Sections à reprendre :** Ouvrir un terminal interactif.

**Constat.** Réutilisation, commandes, sortie en direct, terminal interactif et intégration se partagent la page. Le premier exemple affiche l’échec des tests sans faire échouer le script.

**Action proposée.** Déplacer le terminal interactif vers une tâche dédiée ; nommer clairement la différence entre afficher un verdict et imposer la réussite avant intégration.

**Plan examiné :** Ouvrir une sandbox · Lancer des tours d’agent · Exécuter une commande · Vérifier le résultat · Suivre une commande longue · Ouvrir un terminal interactif · Intégrer le travail vous-même · Workspaces de fichiers · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 158 lignes EN / 158 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Valider les réponses de l’agent — P2

[Français](../../src/content/docs/fr/guide/typed-responses.md) · [English](../../src/content/docs/guide/typed-responses.md)

**Sections à reprendre :** Laisser Outpost demander le format.

**Constat.** Bon premier résultat, puis plusieurs paragraphes de contrat (Standard JSON Schema, métadonnées, références distantes) avant la gestion du cas invalide.

**Action proposée.** Mettre réussite, erreur et réparations à la suite ; déplacer les détails de conversion dans l’API et présenter le validateur personnalisé comme variante avancée.

**Plan examiné :** Demander une réponse JSON · Laisser Outpost demander le format · Utiliser votre propre validation · Valider une réponse transformée hors ligne · Renvoyer du texte brut · Traiter une réponse invalide · Laisser l’agent réparer sa réponse · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 176 lignes EN / 176 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Suivre la progression — P2

[Français](../../src/content/docs/fr/guide/progress.md) · [English](../../src/content/docs/guide/progress.md)

**Sections à reprendre :** Suivre un workflow.

**Constat.** Démarrage simple et résultat décrit. La page enseigne successivement observe d’agent, observe de workflow et hub, sans choix initial suffisamment explicite.

**Action proposée.** Commencer par terminal / événements personnalisés / exécution entière ; éviter les renvois répétés AgentObservation et relier directement le hub.

**Plan examiné :** Traiter les événements vous-même · Suivre un workflow · Traiter les erreurs des observateurs · Tracer toute une exécution · Ce que rapporte chaque agent · Limites · Pour continuer.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 138 lignes EN / 138 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Partager un rapport de run — P1

[Français](../../src/content/docs/fr/guide/run-reports.md) · [English](../../src/content/docs/guide/run-reports.md)

**Sections à reprendre :** Enregistrer un résumé pour la relecture.

**Constat.** Le script de rapport demande une modification sans politique de branche. Avec le Docker de setup, il travaille dans le checkout courant ; avec un fournisseur distant, le défaut intègre. Le rapport pour relecture arrive donc après modification de la branche du lecteur.

**Action proposée.** Utiliser une branche named explicite ; déplacer plafonds, comptages et versions du rapport vers l’API. Corriger le lien tarifs vers estimating-costs et masquage vers redacting-secrets.

**Vérification.** src/infrastructure/git/workspace.ts:27 ; src/application/sandbox-provision.ts:43 ; report.ts aux lignes 16–21.

**Plan examiné :** Enregistrer un résumé pour la relecture · Comprendre ce que le rapport établit · Conserver l’instantané après le nettoyage · Workspaces de fichiers.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 49 lignes EN / 49 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Poursuivre une conversation — P2

[Français](../../src/content/docs/fr/guide/conversations.md) · [English](../../src/content/docs/guide/conversations.md)

**Sections à reprendre :** Reprendre plus tard à partir de l’identifiant.

**Constat.** La tâche centrale « reprendre dans un second script » n’a pas de code, alors que fork, sandbox chaude, stockage et archivage en ont. Le routage est ajouté après la liste API.

**Action proposée.** Ajouter le petit exemple de reprise par ID ; scinder ou regrouper stockage/archivage à part et déplacer la note de routage près de la reprise avancée.

**Plan examiné :** Poursuivre une conversation · Reprendre plus tard à partir de l’identifiant · Dériver une conversation · Poursuivre dans une sandbox ouverte · Ce que chaque agent prend en charge · Où les conversations sont stockées · Archiver et partager via un transport · Désactiver la capture · Limites · Reprendre un harness routé.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 170 lignes EN / 170 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Fixer des délais et annuler une tâche — P2

[Français](../../src/content/docs/fr/guide/limits-and-cancellation.md) · [English](../../src/content/docs/guide/limits-and-cancellation.md)

**Sections à reprendre :** Relancer le brief jusqu’à ce que l’agent le déclare terminé.

**Constat.** La page de délais contient aussi passes, marqueurs de fin, limites Git et six autres systèmes de limites. Le titre « Choisir une limite » ne propose pas vraiment de choix.

**Action proposée.** Séparer les passes successives ; remplacer « Choisir une limite » par un choix durée totale / silence / tentative / workflow avec liens précis.

**Plan examiné :** Limiter la durée d’une tâche · Choisir une limite · Annuler depuis votre code · Relancer le brief jusqu’à ce que l’agent le déclare terminé · Limiter la durée des opérations Git et fichiers · Autres limites · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 144 lignes EN / 144 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Envoyer des consignes pendant une tâche — P2

[Français](../../src/content/docs/fr/guide/steering.md) · [English](../../src/content/docs/guide/steering.md)

**Sections à reprendre :** Comment la consigne arrive à chaque agent.

**Constat.** L’envoi est clair ; les matrices et noms app-server/stream-json imposent ensuite une lecture de protocoles. L’exemple avancé du sous-agent doit être explicitement présenté comme fragment à brancher sur une exécution.

**Action proposée.** Garder les conséquences injected/resumed ; déplacer les mécanismes de protocoles en API, ajouter comment obtenir l’identifiant réel du sous-agent.

**Plan examiné :** Envoyer une consigne · Comment la consigne arrive à chaque agent · Selon le moment de l’envoi · Envoyer une consigne à un sous-agent · Réutiliser le contrôleur · Événements et consommation · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 99 lignes EN / 99 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Détecter un agent qui tourne en rond — P2

[Français](../../src/content/docs/fr/guide/stuck-agents.md) · [English](../../src/content/docs/guide/stuck-agents.md)

**Sections à reprendre :** Interpréter une alerte.

**Constat.** Le mode arrêt est proposé avant l’avertissement, alors que les faux positifs ne sont expliqués qu’en fin de page. Le détail des empreintes et valeurs null est du contrat.

**Action proposée.** Proposer warn comme phase d’observation, puis arrêt/réorientation ; conserver les faux positifs avant l’exemple et renvoyer les règles de comparaison vers l’API.

**Plan examiné :** Arrêter l’activité répétitive · Rediriger l’agent · Observer sans interrompre · Interpréter une alerte.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 75 lignes EN / 75 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
