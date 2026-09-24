# Historique des versions

## Unreleased

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
