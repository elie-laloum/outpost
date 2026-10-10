# Lot 09 — Automatiser

Bon découpage des services, mais la démonstration producteur → résultat manque encore à plusieurs endroits. La durabilité ne doit jamais être assimilée au seul stockage des checkpoints.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Automatiser les exécutions — P1

[Français](../../src/content/docs/fr/guide/unattended-runs.md) · [English](../../src/content/docs/guide/unattended-runs.md)

**Sections à reprendre :** Choisir le déclencheur / Limites.

**Constat.** Affirme que le workflow s’exécute toujours depuis le code TypeScript et qu’un redémarrage reprend chaque job sous checkpoint : les services YAML existent et un handler de file ordinaire n’est pas durable par lui-même.

**Action proposée.** Distinguer entrée TypeScript et YAML ; réserver la reprise durable à defineWorkflowJob/recette avec checkpoint. Garder un choix court de déclencheur, supprimer cartes et matrice en double.

**Plan examiné :** Choisir le déclencheur · Comparer les déclencheurs · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 53 lignes EN / 53 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter depuis la CI — P1

[Français](../../src/content/docs/fr/guide/ci-automation.md) · [English](../../src/content/docs/guide/ci-automation.md)

**Sections à reprendre :** Conserver les données de récupération.

**Constat.** La reprise sur un runner neuf est présentée comme un simple choix S3 pour les checkpoints, alors que les workspaces/conversations requis restent locaux. L’exemple téléverse aussi les journaux et transferts entiers, qui peuvent contenir du contenu sensible : la phrase « ne téléversez jamais .env/identifiants » ne filtre pas leurs contenus.

**Action proposée.** Distinguer inspection et reprise, préciser les workspaces à conserver. Sélectionner et inspecter les données exportées ; ne pas traiter le seul choix des dossiers comme une exclusion des secrets contenus dans les traces.

**Plan examiné :** Préparer le runner · Configurer les identifiants du job · Ajouter le workflow · Faire échouer le job quand le travail échoue · Créer une branche par exécution · Livrer les changements · Conserver les données de récupération · Lancer des exécutions sans job de CI · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 157 lignes EN / 157 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter des jobs avec des workers — P2

[Français](../../src/content/docs/fr/guide/job-queues.md) · [English](../../src/content/docs/guide/job-queues.md)

**Sections à reprendre :** Soumettre du travail.

**Constat.** Annonce pending alors que le worker lancé avant peut déjà avoir fini ; aucun exemple de polling n’amène sûrement jusqu’au résultat 3. Deux sections Pour continuer/aller plus loin et renvois de migration répétés.

**Action proposée.** Faire attendre get jusqu’à un état terminal ou montrer une commande de consultation séparée ; annoncer les états possibles et réunir les suites.

**Plan examiné :** Parcours d’un job · Démarrer un worker · Soumettre du travail · Choisir le stockage de la file · Workspaces de fichiers · Limites · Pour continuer · Pour aller plus loin.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 123 lignes EN / 123 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter des workflows depuis une file — P2

[Français](../../src/content/docs/fr/guide/queued-workflows.md) · [English](../../src/content/docs/guide/queued-workflows.md)

**Sections à reprendre :** Exécuter des jobs indépendants.

**Constat.** Mélange attendre un job et exécuter un workflow comme job. Le dernier exemple n’utilise aucune file : deux tâches de fichiers sont présentées comme des jobs.

**Action proposée.** Distinguer les deux directions avec un schéma simple et un worker/producteur complet ; déplacer les tâches de fichiers hors de cette page ou montrer leur enqueue réel.

**Plan examiné :** Attendre un job dans un workflow · Associer un checkpoint à chaque job · Exécuter des jobs indépendants.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 151 lignes EN / 151 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exploiter et relancer les workers — P3

[Français](../../src/content/docs/fr/guide/operating-workers.md) · [English](../../src/content/docs/guide/operating-workers.md)

**Sections à reprendre :** Réservation / Dédupliquer les effets.

**Constat.** Bonne page d’exploitation, conséquences concrètes et limites honnêtes. L’exemple d’idempotence déclare un contrat de service sans implémentation.

**Action proposée.** Conserver la structure ; nommer explicitement le service externe à fournir et donner un scénario panne/reprise attendu. Renvoyer bornes numériques des leases à l’API.

**Plan examiné :** Réservation des jobs et nouvelles tentatives · Dédupliquer les effets avec les clés d’idempotence · Exploiter les workers.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 57 lignes EN / 57 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Partager une file par HTTP — P2

[Français](../../src/content/docs/fr/guide/http-queues.md) · [English](../../src/content/docs/guide/http-queues.md)

**Sections à reprendre :** Exposer une file via HTTP.

**Constat.** Le serveur est montré, le client distant seulement décrit. On doit assembler une troisième page pour essayer une file réseau ; la fermeture propre n’est que textuelle.

**Action proposée.** Ajouter un client producteur minimal et une commande de test locale avant TLS/rotation ; relier explicitement la même file au worker.

**Plan examiné :** Exposer une file via HTTP.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 30 lignes EN / 30 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Utiliser Redis et BullMQ — P2

[Français](../../src/content/docs/fr/guide/redis-workers.md) · [English](../../src/content/docs/guide/redis-workers.md)

**Sections à reprendre :** Ce que l’adaptateur possède / Finalisation interrompue.

**Constat.** Bon départ opérationnel mais internals BullMQ et protocole de finalisation occupent une grande partie de la page. Le premier résultat n’est pas indiqué.

**Action proposée.** Donner commande worker/producteur et résultat à consulter ; regrouper rotation, panne et arrêt dans une partie exploitation ; garder noeviction et déduplication visibles.

**Plan examiné :** Prérequis · Régler la politique d’éviction · Configurer la file · Connecter producteurs et workers · Ce que l’adaptateur possède · Finalisation interrompue · Renouveler les identifiants Redis · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 155 lignes EN / 155 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Planifier des exécutions régulières — P2

[Français](../../src/content/docs/fr/guide/cron-schedules.md) · [English](../../src/content/docs/guide/cron-schedules.md)

**Sections à reprendre :** Publier un job / Exécuter le script.

**Constat.** Premier résultat potentiellement à 02:00 seulement : difficile à essayer rapidement. Les particularités DST sont précises mais l’exemple ne prouve pas le trajet complet jusqu’au worker.

**Action proposée.** Proposer une fréquence chaque minute pour l’essai puis l’horaire réel ; montrer consultation de file et relier queued-workflows. Garder les règles de rattrapage et de DST.

**Plan examiné :** Publier un job selon une planification · Exécuter les jobs publiés · Écrire l’expression cron · Nommer chaque exécution d’après sa date locale · Changements d’heure · Exécuter plusieurs planificateurs · Rattraper un créneau après un redémarrage · Gérer les échecs de publication · Calculer des créneaux sans publier · Planifier depuis la CI · Workspaces de fichiers · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 149 lignes EN / 149 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Lancer du travail depuis des webhooks — P1

[Français](../../src/content/docs/fr/guide/webhooks.md) · [English](../../src/content/docs/guide/webhooks.md)

**Sections à reprendre :** Limites / Recevoir un webhook.

**Constat.** Affirme qu’aucune commande CLI ne lance le serveur, alors que recipe serve peut lancer un service triggers. Premier exemple sans vérification locale ni résultat démontré.

**Action proposée.** Corriger la limite et relier recipe-services ; ajouter une livraison signée locale avec résultat 202/401. Séparer mise en route et exploitation/rotation, garder autorisation de l’acteur avant toute exécution.

**Vérification.** Aide locale de recipe serve et déclaration service.triggers dans recipe-services ; la limite est fausse dans les deux langues.

**Plan examiné :** Recevoir un webhook et publier un job · Choisir une source · Lire l’événement · Autoriser les émetteurs · Lire la réponse HTTP · Éviter les jobs en double · Identifier l’exécution à partir de l’événement · Renouveler un secret · Exploiter le serveur · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 191 lignes EN / 191 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
