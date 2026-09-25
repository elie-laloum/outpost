---
title: "Historique des versions"
description: "Historique des versions — Outpost API"
sidebar:
  order: 2
---

Traduction du journal `CHANGELOG.md` conservé à la racine du dépôt. Chaque version publiée possède ses notes dans les deux langues.

## 4.1.0

- Préserver le shell de session Daytona et le statut réel des commandes non interactives ; accepter une PTY déjà supprimée pendant le nettoyage après annulation. Ajouter les régressions des deux défauts trouvés en tests réels. Valider les workflows Claude OAuth sur Docker, Vercel et Daytona, ainsi que la saisie, le redimensionnement, la sortie, l’annulation et la réutilisation du terminal Daytona. La validation réelle de Codex par clé API reste à effectuer.
- Remplacer le parsing global et l’aide manuelle du CLI par les sous-commandes Commander et leurs options propres ; utiliser les sélections Clack pour l’initialisation interactive. Les options d’autres commandes auparavant ignorées sont désormais refusées. Les sorties sans terminal et JSON restent sans décoration.
- Guider le choix du gestionnaire de paquets et de l’authentification. Vérifier la disponibilité du gestionnaire avant écriture avec `--install`. Construire automatiquement les images Docker/Podman ; `--no-build` permet de générer les fichiers sans build. Les workflows déjà générés restent inchangés.
- Générer les parcours explicites par clé API, jeton d’abonnement Claude et session de compte Codex. Vérifier les credentials requis avant allocation ; préparer la connexion API Codex par stdin ou copier une source de credentials de compte explicitement sélectionnée dans le home privé du sandbox. Les trousseaux hôtes ne sont pas exportés.
- Ajouter `CodexModelProvider` avec URL Responses personnalisée et nom de variable de clé API ; exposer `--base-url`, `--api-key-env` et `--model` dans init. Les endpoints limités à Chat Completions ne sont pas pris en charge. Vérifier la connexion native Codex contre un endpoint Responses simulé local dans la CI container.
- Conserver les variables d’allocation Vercel pour chaque commande, avec priorité aux variables de commande. Tester la transmission du jeton Claude par le script généré et documenter la conservation des variables lors d’un changement de provider.
- Ajouter des campagnes cloud Claude/Codex authentifiées activables manuellement, avec rapports sans secrets. Les credentials absents restent ignorés ; cette fixture ne prouve pas la réussite d’une campagne sur un compte réel. Les campagnes planifiées n’appellent pas les modèles.
- Recentrer la roadmap bilingue sur la fiabilité à court terme et les orientations à moyen terme, avec critères explicites de validation.

## 4.0.0

Cette version majeure étend les unions publiques de statuts des workflows. Les consommateurs exhaustifs doivent traiter les statuts de tâche `paused` et `rejected`, ainsi que le statut de résultat de workflow `paused`. Les fonctionnalités de recherche restent sur activation explicite, avec leurs limites documentées.

- Allouer les workspaces des conteneurs isolés sous un parent privé accessible en écriture pour Podman rootless, et publier les artefacts sans recréer les racines de disque Windows. Documenter la récupération manuelle des verrous de checkpoint quand la propriété du processus ne peut pas être vérifiée.
- Créer récursivement les dossiers Vercel de workspace et les parents des destinations de transfert avant toute écriture.

- Ajouter les réservations coopératives liées au workspace, la restauration isolée des états précédent/entrant conservés et l’inspection locale de l’activité des sandboxes et ressources.
- Regrouper et vérifier les uploads incrémentaux de fichiers/liens ; transférer les différences d’historique Git vérifiées tout en conservant des bundles de récupération complets. Les copies de dossiers gardent leur comportement existant.
- Persister les checkpoints avec résultats JSON, répétition explicite et consommation cumulée. Ajouter approbations/pauses et artefacts immuables typés avec filiation non signée.
- Ajouter des files SQLite persistantes, un transport HTTP authentifié et des workers avec fencing. Les répétitions peuvent reproduire des effets ; les reçus de consommation terminale évitent le double comptage sans garantir un plafond de facturation en temps réel.
- Étendre les statuts de tâche avec `paused` et `rejected`, et le statut du workflow avec `paused` ; les consommateurs exhaustifs doivent les traiter. Ajouter des méthodes optionnelles de synchronisation des checkpoints et de reçus de consommation aux contextes de tâche.
- Prendre en charge le PTY natif Daytona avec annulation, redimensionnement et réutilisation ; la validation réelle avec compte reste à effectuer.
- Ajouter l’adapter Gemini CLI, le bootstrap, les diagnostics et l’installation dans les images épinglés à 0.61.0. Gemini ne prend en charge que les nouvelles sessions, sans capture native, continuation ni réparation automatique des réponses.
- Ajouter des prototypes sur activation explicite : checkouts Git Docker/Podman isolés, microVM Firecracker sur hôte préparé, blocage réseau total des conteneurs/politiques Vercel et candidats spéculatifs bornés avec validation explicite et sans intégration automatique.
- Attribuer les rapports cloud au commit/runtime/date et conserver les preuves de vérification d’attestation d’image réussie. Campagnes cloud réelles, publication signée et démarrage Firecracker restent des validations distinctes, jamais des réussites implicites.
- Synchroniser toute la référence API publique, les guides bilingues et la roadmap avec le comportement implémenté et les limites restantes des prototypes.

## 3.0.0

- Canonicaliser les dossiers temporaires de vérification de récupération sur les différentes plateformes et réutiliser les volumes de cache Podman existants sans les recréer.
- Rupture de compatibilité : les implémentations personnalisées de `Sandbox`, `TaskContext` et `WorkflowResult` doivent fournir respectivement `diagnose`, `reportUsage` et `usage` ; les observateurs exhaustifs doivent traiter les nouveaux événements `attempt` et `usage`. Les objets créés par les factories fournissent automatiquement ces membres.
- Traiter prudemment la propriété incertaine ou ancienne des verrous ; les écritures simultanées vers un même journal configuré provoquent désormais un conflit au lieu de partager le fichier.
- Ajouter des budgets partagés de tentatives et de consommation observée par workflow, couvrant retries et réparations agents, avec attente des tentatives admises et annulation coopérative aux limites de consommation.
- Ajouter des événements structurés de consommation et de cycle de vie des workflows ainsi qu’une entrée OpenTelemetry optionnelle avec tracer/meter injectés, noms de spans fixes, compteurs et histogrammes de durée sans contenus ni identifiants des tâches.
- Diagnostiquer les sandboxes détenues par l’appelant avec une opération exclusive, des probes binaires optionnelles et leur nettoyage ; distinguer capacités observées, contrats déclarés et contrôles des fixtures de protocole embarquées.
- Ajouter des fixtures cloud sans identifiants et des vérifications Vercel/Daytona planifiées sur activation explicite, avec rapports filtrés, nettoyage indépendant et contrôles optionnels des CLI réelles ; les appels modèles authentifiés restent hors de cette suite.
- Attendre le code de sortie des commandes Daytona après fermeture des sorties, et enregistrer le nettoyage de l’allocation avant la découverte du home.
- Ajouter des plans explicites de rétention, un nettoyage avec revalidation et un contrôle d’admission des quotas ; protéger les artefacts de récupération, les journaux incertains et les workspaces contenant des fichiers ignorés.
- Observer la propriété des verrous avec l’identité Linux de l’hôte, du démarrage, du namespace et du processus ; sérialiser la reprise des verrous périmés et refuser les propriétaires incertains.
- Vérifier bundles, objets Git et applicabilité des patches conservés dans une copie isolée, sans filtres Git hérités ni modification du dépôt source.
- Ajouter des caches de dépendances Docker/Podman optionnels, avec clés d’invalidation explicites et séparation par dépôt, image et utilisateur ; ajouter la construction d’images d’agents épinglées et un workflow de publication contrôlé avec vérification de provenance signée.
- Télécharger les fichiers non suivis modifiés de Vercel/Daytona avec manifestes SHA-256 et lots gzip bornés ; réutiliser les fichiers inchangés vérifiés tout en conservant des sauvegardes complètes et en protégeant les fichiers hôtes ignorés.
- Enregistrer des manifestes SHA-256 atomiques pour les nouvelles sauvegardes de transfert avant application hôte ; ajouter `recovery verify --checksums` avec vérification en flux bornée, résultats absents/divergents explicites et état hôte préservé si la capture échoue.
- Ajouter les contrôles en lecture seule `recovery verify --directory` des métadonnées de transfert et fichiers de sauvegarde requis, avec lecture bornée et distinction explicite de l’intégrité du contenu ou d’une validation de restauration.
- Ajouter `recovery inspect --locks` avec lecture bornée des métadonnées et observation locale des PID ; signaler les enregistrements invalides ou non vérifiables sans présumer la propriété ni supprimer de verrous.
- Ajouter les rapports optionnels `recovery inspect --git` avec branche/HEAD détachée, état clean/dirty, verrous Git et états non enregistrés/indisponibles explicites, sans rafraîchir les index ni nettoyer le registre.
- Ajouter les rapports en lecture seule `outpost recovery inspect` pour récupération, logs, verrous et workspaces gérés, avec tailles logiques issues des métadonnées, protection contre les liens symboliques et résultats partiels explicites en cas de limite ou d’erreur de parcours.
- Vérifier l’aide des commandes agents par défaut de lancement/reprise/fork dans les images de diagnostic, en contrôlant usage et options déclarées plutôt que le seul code de sortie ; conserver explicitement l’exécution réelle et la compatibilité du protocole comme non vérifiées.
- Étendre `doctor --image` au diagnostic d’une image Docker/Podman locale dans une sandbox temporaire, sans téléchargement d’image ni réseau ; distinguer versions des agents de l’image, erreurs de nettoyage et vérifications hôtes.
- Ajouter `outpost doctor` avec vérifications bornées des prérequis hôtes, accès Docker/Podman, comparaison des versions des agents hôtes, capacités non vérifiées explicites et rapports JSON.

## 2.0.0

- Normaliser le dossier du test de workflow avant de calculer les chemins relatifs des dépôts, pour corriger la CI macOS avec les dossiers temporaires symboliques.
- Affiche la progression de l’agent dans les scripts générés et les détails de récupération lors d’une annulation, sans trace d’erreur non interceptée.
- Documente en français et en anglais les dossiers de workflow, les chemins des dépôts et les tâches multi-dépôts.
- Générer les projets de workflow directement dans le dossier choisi, avec `run.ts`, un manifeste par défaut et conservation des fichiers package/ignore existants.
- Ajouter `init --repository` pour cibler un dépôt externe ; résoudre brief et environnement depuis le script et conserver l’image du workflow indépendamment du dépôt ciblé.
- Lire les recettes d’image à la racine du workflow ; les anciennes installations peuvent utiliser `--file .outpost/Dockerfile`.
- Supprimer les campagnes d’issues, les connecteurs de backlog GitHub/Beads/personnalisés et leurs types publics.
- Simplifier l’initialisation en un script de dispatch ; retirer les modèles de campagne, `--template`, `--tracker`, `--label`, les fichiers de tracker et l’installation des CLI GitHub/Beads.

## 1.1.4

- Attente de la fin des commandes non interactives et transmission du vrai code de sortie ; réutilisation du terminal du runtime en mode interactif.
- Transfert d’archives binaires dans le conteneur Docker/Podman actif : uploads et capture/restauration des conversations voient le même home tmpfs que les agents.
- Conservation des permissions ordinaires et liens, rejet des destinations dangereuses et compatibilité GNU tar/bsdtar.
- Création d’un home privé inscriptible dans les images, y compris sans montage tmpfs.
- Tests de régression sur les conteneurs réels, pseudo-terminaux, annulations, fichiers binaires et conversations natives.
- Guides de connexion Claude Code/Codex et sept cookbooks progressifs en anglais et français.

## 1.1.3

- Documentation Astro Starlight en anglais et français, avec anglais par défaut, guides ciblés et référence de tous les exports publics.
- Vérification en CI des traductions, exemples TypeScript, liens, navigation et fichiers de recherche.
- Déploiement d’un seul site GitHub Pages après les releases stables réussies, protégé contre le retour à une ancienne version.
- Déplacement du démarrage français et de la roadmap dans le site ; conservation du changelog racine et suppression des anciennes migrations et du fichier de contribution.
- Exclusion des outils documentaires de l’archive de la bibliothèque.

## 1.1.2

- Alignement des métadonnées npm sur l’origine GitHub de la compilation pour la provenance. GitLab reste le dépôt source principal.

## 1.1.1

- Séparation des adapters Claude et Codex, de la construction des commandes et du décodage ; conservation des événements inconnus comme observations brutes.
- Découpage de l’allocation, de la propriété des opérations, du dispatch, de l’attachement, du stockage des conversations et de la récupération en services dédiés.
- Séparation de la planification des campagnes, de l’exécution des issues et de l’intégration ; isolation de l’état, des tentatives et de l’ordonnancement des workflows.
- Isolation de la configuration des containers, montages, commandes et transferts, adapters cloud, worktrees Git et étapes de synchronisation distante.
- Extraction des contrats dans `.types.ts` et des constantes dans `.constants.ts`, sans changer les points d’entrée publics.
- Contrôle en CI des dépendances, du placement des types et des déclarations inutilisées ; documentation bilingue de l’architecture.

## 1.1.0

- Campagnes d’issues typées avec planification dynamique, concurrence bornée, branches par issue, revue dans la même sandbox, intégration vérifiée et fermeture du tracker.
- Connecteurs complets GitHub et Beads et scripts de campagne exécutables.
- Isolation des passes ponctuelles, validation préalable de l’annulation et des réponses structurées, conservation de la sortie brute et finale des agents.
- Transcripts par tour, stores personnalisés, réécriture sélective des chemins et compteurs de cache Claude séparés.
- Alignement des variables autorisées, prompts relatifs à l’appelant, collecte interactive et ordre des hooks.
- Récupération des workspaces, actualisation des branches réutilisées et préservation des modifications locales pendant la synchronisation distante de l’historique commité.
- Options de namespace Podman, contrôles macOS, préparation des montages de fichiers et transferts bornés.
- Affichage de progression, journaux ajoutables, métadonnées de récupération et restauration du terminal.
- Extension des tests fonctionnels, providers et packages ; documentation bilingue de l’évolution des contrats.

## 1.0.0

Première version d’Outpost.

- Propriété séparée des workspaces et sandboxes, environnements réutilisables et fermeture asynchrone.
- Adapters Codex et Claude Code avec conversations natives, reprise et fork.
- Providers Docker, Podman, local, Vercel et Daytona, avec contrats extensibles.
- Worktrees gérés, branches nommées, intégration automatique et récupération.
- Synchronisation distante préservant l’identité des commits et protégeant les changements locaux concurrents.
- Fichiers de prompt, variables typées, expansion de commandes, boucles de complétion et délais d’inactivité.
- Réponses texte/JSON balisées, Standard Schema et réparations avec reprise.
- Workflows typés avec conditions, tentatives, annulation, concurrence et diagrammes.
- Initialisation interactive ou automatisée, cinq modèles et connecteurs d’issues.
- Documentation anglais/français, tests multiplateformes, seuils de couverture et publication automatisée.
