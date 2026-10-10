# Mise en œuvre de la revue

Cette passe applique la revue approuvée dans `/tmp/outpost-guide-reorganization`, branche `docs/guide-reorganization`, à partir de `3a676536` et des refontes documentaires déjà présentes dans ce worktree. Les travaux non commités du checkout d’origine n’ont pas été copiés. Aucun commit, merge ou publication.

Le [diagnostic initial](README.md) et ses preuves restent un état des lieux antérieur aux corrections. Ce document décrit les changements qui lui succèdent.

## Changements par lot

| Lot                             | Mise en œuvre                                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 — Premiers pas               | Parcours conservé ; inspection séparée des commits, des fichiers modifiés et des fichiers non suivis dans le worktree retenu. Choix TypeScript/YAML visible dès l’accueil.                                                                                          |
| 02 — Exécuter et examiner       | Rapports sur branche nommée ; lecture des journaux sans relancer leur enregistrement ; extraction des passes d’agent et des commandes dans les briefs ; réponses JSON présentées avant les variantes.                                                               |
| 03 — Gérer les fichiers         | Sauvegarde et restauration exécutables dans deux processus ; chemins du workspace visibles ; résolution des conflits séparée de l’intégration normale ; distinction historique Git transféré/fichiers sélectionnés.                                                 |
| 04 — Composer des workflows     | Test de workflow avec dépôt temporaire autonome ; réutilisation de sandbox déplacée vers son sujet ; résultat de cache et conditions de renouvellement expliqués.                                                                                                   |
| 05 — Suspendre et reprendre     | Récupération après crash séparée de la reprise normale ; stockage des conversations extrait ; exemple de spéculation durable assemblé avec autorisation explicite de rejeu.                                                                                         |
| 06 — Agents                     | Préparation distante des candidats de repli corrigée ; refus de capacités remontés au point de choix ; profil minimal sans serveur MCP fictif obligatoire ; limites d’Antigravity et de Copilot explicites.                                                         |
| 07 — Préparer l’exécution       | Caches séparés de la préparation ; terminal interactif séparé des sessions ; priorité des variables distinguée des conflits de configuration ; limites des modes fichiers conservées.                                                                               |
| 08 — YAML                       | Callbacks séparés des données et dépendances ; exemple YAML et module TypeScript associés ; catalogue généré regroupé en sept familles au lieu d’une liste indifférenciée.                                                                                          |
| 09 — Automatiser                | Client HTTP et lecture de résultat ajoutés ; exploitation des webhooks extraite ; requête signée locale vérifiée ; distinction entre checkpoint distant et fichiers nécessaires à la reprise.                                                                       |
| 10 — Stocker et suivre          | Rejeu indépendant du script d’enregistrement ; choix du suivi selon la sortie recherchée ; panne d’observateur démontrée hors ligne ; distinction entre clés logiques et objets de stockage.                                                                        |
| 11 — Diagnostiquer et récupérer | CLI de récupération complétée pour publications, workspaces et registres ; gestion d’erreur qui conserve l’échec ; aperçu avant nettoyage Git ; motifs de rétention explicités.                                                                                     |
| 12 — Boucle d’agent             | Création d’outils et hooks extraits ; exemple d’outil relié à un agent ; contexte présenté par choix de stratégie ; détection de répétition introduite en avertissement avant arrêt.                                                                                |
| 13 — Exemples complets          | Neuf projets téléchargeables dans les deux langues, générés depuis les snippets ; CI ramenée à trois fichiers ; prérequis et commandes explicites ; série plan/tests/code présentée comme trois exécutions ; revue sur label produisant un rapport JSON local réel. |
| 14 — Extensions                 | Petite CLI de démonstration fournie avec son adaptateur ; patrons de fournisseur clairement annoncés comme tels ; extension YAML reliée au premier callback.                                                                                                        |
| 15 — API                        | Toutes les signatures des huit fonctions surchargées conservées, avec tables par variante ; correction des champs obligatoires issus de types mappés ; explications maintenues puis régénérées ; liens vers les nouveaux sujets.                                    |
| 16 — Canvas                     | Rôles et conditions précisés ; graphe de développement réunifié avec refus et épuisement ; candidats concurrents séparés ; vue mobile verticale avec conditions visibles ; texte desktop à taille normale au premier affichage.                                     |
| 17 — Entrées et règles          | Accueil ramené à trois suites, README aligné sur le premier résultat, règles sans limite arbitraire de lignes ; signalement privé GitHub et support de la dernière majeure selon la réponse du mainteneur.                                                          |

Le Guide compte désormais 129 pages par langue. Onze sujets ont été extraits pendant cette passe : caches, création d’outils, hooks, conflits, exploitation des webhooks, récupération après crash, callbacks YAML, terminal interactif, passes d’agent, commandes de brief et stockage des conversations. Les routes des pages conservées restent stables ; les anciennes ancres de sections renvoient aux sujets déplacés.

## Choix éditoriaux

Les neuf exemples complets disposent d’une archive ; leurs fichiers ne sont pas tous fusionnés en un script. Les limites de responsabilité, les points d’entrée et les imports restent explicites. Les archives incluent les fichiers partagés déclarés dans le Markdown.

La revue sur label se termine par un reçu JSON local dédupliqué. Publier un commentaire GitHub reste une adaptation à écrire ; le Guide ne présente plus un stub de publication comme une intégration prête à lancer. Les variantes GitLab et Slack exigent leur propre résolution fiable des commits.

Les cartes simples restent utilisables dans le composant canvas partagé. Sur mobile, elles se lisent comme une liste sans commande de zoom. Sur grand écran, les graphes étendus peuvent demander un déplacement pour conserver un texte lisible.

Les procédures de secrets restent regroupées, avec des accès directs par service : le choix dépend du gestionnaire déjà utilisé, et les règles de sélection et de propriété des identifiants sont communes. La page de choix des sandboxes commence maintenant par Docker, supprime la liste en double et garde la comparaison avancée.

## Validation

Contrôles exécutés avec Node.js 24.7.0 dans le worktree :

| Contrôle                                     | Résultat                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run docs:sync` (inclut `bun run build`) | Réussi ; 102 composants YAML et 723 contrats API par langue synchronisés.                                                                                                                   |
| `bun run docs:check`                         | Réussi ; 854 pages par langue vérifiées et 37 tests réussis.                                                                                                                                |
| `bun run docs:build`                         | Réussi ; 2 623 pages générées, redirections comprises.                                                                                                                                      |
| `bun run docs:test`                          | Réussi ; liens, ressources, ancres, recherche et 570 icônes contrôlés ; 1 002 extraits TypeScript vérifiés, 68 extraits hors ligne exécutés, quatre tests de canaux de publication réussis. |
| `bun run docs:test:browser`                  | 120 tests réussis, en prévisualisation et en développement selon la configuration du dépôt.                                                                                                 |
| Prettier sur les fichiers modifiés           | Réussi ; 402 fichiers contrôlés, puis nouveau contrôle des derniers fichiers corrigés et du présent rapport.                                                                                |
| `git diff --check`                           | Réussi.                                                                                                                                                                                     |

Les tests d’exemples couvrent les imports et archives des neuf projets bilingues, les chemins Git avec espaces/Unicode/renommages, la restauration de fichiers entre processus, la lecture et le rejeu sans réexécution de l’enregistrement, et les réponses 202/401 d’un webhook signé local. Ces essais utilisent des ressources temporaires et des agents simulés lorsqu’un agent est nécessaire.

Un essai supplémentaire a exécuté les fichiers publiés de la CLI de démonstration avec `createLocalSandboxProvider()` dans un dépôt Git temporaire : réponse `Received 51 characters`. Les 18 archives générées ont été ouvertes avec un lecteur tar standard ; le téléchargement français de développement a répondu HTTP 200 avec `application/gzip`.

Les [mesures des canvas](implementation-canvas.json) couvrent 60 rendus : 15 pages × deux langues × deux dimensions. Le texte descriptif initial mesure 14 px ; aucun graphe ne déborde de son cadre mobile. Quatre rendus desktop nécessitent un déplacement horizontal pour préserver cette taille. Les captures de développement ont aussi été inspectées visuellement.

Prévisualisation maintenue : <http://localhost:4321/outpost/fr/guide/introduction/>.

## Limites

Les agents réels, les modèles payants et les services cloud n’ont pas été lancés. Les prérequis de validation réelle restent visibles dans leurs guides. Les tests hors ligne ne prouvent pas une compatibilité nouvelle avec une CLI distante ou un service fournisseur.

L’API a reçu les corrections ciblées confirmées par la revue ; il ne s’agit pas d’une certification individuelle des 723 contrats. Le catalogue public de tarifs reste court et renvoie aux contrats précis. Aucun changement de comportement du produit n’a été effectué dans `src/`.
