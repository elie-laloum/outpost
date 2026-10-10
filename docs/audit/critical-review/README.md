# Revue critique de la documentation Outpost

Ce diagnostic décrit l’état avant corrections. Consultez la [mise en œuvre et ses validations](implementation.md) pour l’état livré après approbation.

Revue du 10 octobre 2026, sur `/tmp/outpost-guide-reorganization`, branche `docs/guide-reorganization`, base `3a676536` avec les modifications documentaires déjà présentes. Le checkout d’origine et ses travaux non commités ne sont pas inclus. Aucun contenu du site, code produit, commit, merge ou publication n’a été modifié pendant cette revue : seuls ces rapports et leurs preuves ont été ajoutés.

**Verdict : le Guide est nettement plus accessible, mais il n’est pas encore assez directement utilisable.** Le principal problème n’est plus une longueur excessive partout. Ce sont les parcours interrompus, le code trop fragmenté, les descriptions qui restent internes et quelques exemples dont l’effet réel contredit la promesse. Découper encore toutes les pages aggraverait une partie de ces problèmes.

Les bonnes bases sont à conserver : le premier README, le premier workflow, les petites démonstrations hors ligne, la séparation agent/sandbox/workspace et les avertissements sur les données conservées. La section « Charger un catalogue public de tarifs » est désormais suffisamment courte ; je ne la remettrais pas en chantier prioritairement.

## Les défauts à corriger d’abord

| Priorité | Constat confirmé                                                                                                                | Effet pour le lecteur                                                                                      | Détail                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P1       | Lecture de journal et rejeu importent un module contenant un dispatch au niveau supérieur.                                      | Une consultation ou un rejeu dans un nouveau processus déclenche une nouvelle tâche d’agent.               | [Stocker et suivre](10-stocker-et-suivre.md)                                                            |
| P1       | Huit API surchargées n’affichent qu’une signature ; `dispatch.agent` est présenté comme facultatif.                             | L’API ne permet pas de comprendre ou copier correctement les variantes Git/fichiers.                       | [Référence API](15-api.md)                                                                              |
| P1       | Les 16 canvas du Guide et celui de l’accueil affichent leur texte à environ 6 px sur mobile.                                    | Le premier affichage ne permet pas de lire le graphe ; zoom et déplacement deviennent des prérequis.       | [Canvas et captures](16-canvas.md)                                                                      |
| P1       | Le script de rapport omet la politique de branche.                                                                              | Avec le Docker de setup, l’agent modifie le checkout courant avant la relecture du rapport.                | [Exécuter et examiner](02-executer-et-examiner.md)                                                      |
| P1       | L’exemple « complet » de revue sur label laisse fetch/publication sous forme de fonctions qui lèvent une erreur.                | Copier les fichiers ne produit pas le résultat annoncé.                                                    | [Exemples complets](13-exemples-complets.md)                                                            |
| P1       | Le parseur de chemins Git du tutoriel de tests ne gère pas les noms cités/échappés.                                             | Des fichiers de test valides avec espaces ou accents ne sont pas reconnus correctement.                    | [Exemples complets](13-exemples-complets.md), [reproduction](evidence/git-proof.json)                   |
| P1       | La vérification de la première tâche ne regarde que les commits.                                                                | Un diff vide ne montre pas les modifications non commitées ou les fichiers non suivis laissés par l’agent. | [Premiers pas](01-premiers-pas.md)                                                                      |
| P1       | Plusieurs affirmations ne suivent plus le code : bootstrap du secours, CLI des webhooks, commandes de récupération de fichiers. | Le lecteur prépare mal son environnement ou ne trouve pas une opération pourtant disponible.               | [Agents](06-agents.md), [Automatiser](09-automatiser.md), [Récupérer](11-diagnostiquer-et-recuperer.md) |

La reprise sur un autre runner, le dépôt jetable des tests et la priorité des variables demandent aussi une correction avant de recommander ces exemples. Ils sont détaillés dans leurs lots. La priorité P1 désigne une promesse trompeuse, une vérification insuffisante ou un résultat empêché ; elle ne signifie pas une vulnérabilité du produit.

## Retour page par page

Chaque lot donne une observation et une action pour **chaque page**, cite les sections concernées et liste le plan examiné. Les repères de longueur et de nombre de fichiers ne sont pas des objectifs éditoriaux.

- **P1 :** corriger avant de présenter le parcours comme fiable ou directement utilisable.
- **P2 :** réorganiser, compléter un résultat, enlever une répétition ou clarifier un contrat.
- **P3 :** conserver l’essentiel ; amélioration locale seulement.

| Lot                                                                   |           Pages par langue | Retour principal                                                               |
| --------------------------------------------------------------------- | -------------------------: | ------------------------------------------------------------------------------ |
| [01 — Premiers pas](01-premiers-pas.md)                               |                          5 | Parcours à conserver ; compléter l’inspection du travail laissé.               |
| [02 — Exécuter et examiner](02-executer-et-examiner.md)               |                          9 | Bonnes tâches, mais rapport et journal ont des effets inattendus.              |
| [03 — Gérer les fichiers](03-gerer-les-fichiers.md)                   |                          8 | Clarifier les modes fichiers et donner une véritable restauration.             |
| [04 — Composer des workflows](04-composer-des-workflows.md)           |                         10 | Réduire les catalogues ; rendre les exemples moins fragmentés.                 |
| [05 — Suspendre et reprendre](05-suspendre-et-reprendre.md)           |                          5 | Séparer reprise ordinaire, crash et variantes avancées.                        |
| [06 — Agents](06-agents.md)                                           |                         11 | Garder les différences utiles, retirer les projections et capacités répétées.  |
| [07 — Préparer l’exécution](07-preparer-execution.md)                 |                         11 | Scinder surtout préparation/caches et gestionnaires de secrets.                |
| [08 — Utiliser YAML](08-yaml.md)                                      |                         12 | Faire évoluer un fichier complet au lieu d’accumuler des fragments.            |
| [09 — Automatiser](09-automatiser.md)                                 |                          9 | Montrer producteur → résultat ; corriger les promesses de durabilité.          |
| [10 — Stocker et suivre](10-stocker-et-suivre.md)                     |                          9 | Corriger les imports avec effets ; rendre chaque sortie observable.            |
| [11 — Diagnostiquer et récupérer](11-diagnostiquer-et-recuperer.md)   |                          7 | Compléter la CLI fichiers et répondre aux symptômes courants.                  |
| [12 — Créer une boucle d’agent](12-boucle-agent.md)                   |                          9 | Montrer les outils et permissions en action avant leurs contrats.              |
| [13 — Exemples complets](13-exemples-complets.md)                     |                          9 | Revoir le format des projets, les stubs et la continuité entre leçons.         |
| [14 — Étendre Outpost](14-etendre-outpost.md)                         |                          4 | Assumer les patrons fictifs ou fournir une fixture exécutable.                 |
| [15 — API](15-api.md)                                                 |                        723 | Inventaire de toutes les pages ; surcharges et présence des champs à corriger. |
| [16 — Canvas](16-canvas.md)                                           | 16 schémas Guide + accueil | Contenu de chaque graphe et mesures réelles EN/FR.                             |
| [17 — Entrées, navigation et règles](17-entrees-navigation-regles.md) |                Transversal | Accueil, README, versions, sécurité, liens, langue et découpage.               |

Inventaires exploitables : [118 pages Guide](guide-pages.csv) et [723 pages API](api-pages.csv), chacun avec une entrée par paire EN/FR.

## Réorganisation recommandée

**Ne pas créer une troisième grande arborescence.** Conserver Guide et API, avec les groupes thématiques actuels, mais différencier les parcours dans chaque groupe : essayer, résoudre une tâche, comprendre le comportement.

Les extractions qui ont un objectif réel : préparation des dépendances / caches ; sélection des outils / création d’un outil ; permissions / hooks ; reprise normale / récupération après crash ; webhook initial / exploitation et rotation ; données YAML / callbacks et boucles. Les secrets peuvent avoir une page de choix et des procédures par service lorsque leurs prérequis diffèrent vraiment.

À l’inverse, les exemples complets ont besoin d’être **rassemblés** : un projet récupérable, une arborescence, une commande, un résultat. Les explications peuvent ensuite se répartir sur plusieurs pages. La série plan → tests → développement doit annoncer qu’elle recommence un workflow avec un autre checkpoint, ou devenir un seul projet exécuté progressivement. Copier des déclarations n’est pas reprendre le résultat de la leçon précédente.

Les canvas doivent expliquer le graphe avant le code lorsque cela aide. Sur mobile, proposer une vue verticale lisible sans zoom ; garder les boucles et embranchements utiles et remplacer les chaînes simples par du texte ou une illustration statique.

## Contrôles réellement effectués

- Lecture critique des 118 pages du Guide français, de leur plan, de leurs renvois et de leurs exemples ; comparaison anglaise ciblée, en particulier pour les constats prioritaires. Comparaison des blocs de code sur les 118 paires : 109 identiques, neuf différences de texte/commentaires examinées.
- Inventaire structurel des 723 paires API, des 31 familles et des liens vers les guides ; lecture des entrées de familles et de contrats ciblés. Inspection TypeScript des surcharges dans les déclarations compilées. Les signatures de code EN/FR sont identiques dans les 723 paires.
- Lecture des points d’entrée, navigation, règles éditoriales, README et SECURITY ; revue de l’organisation du changelog et des notes récentes.
- Chromium : 60 visites de pages Guide, soit les 15 pages à canvas × deux langues × deux dimensions ; mesures de 64 rendus de canvas. Huit visites supplémentaires pour accueil et `dispatch`. Six captures conservées et deux inspectées visuellement en détail.
- Reproduction Git dans un dépôt temporaire : diff de commits vide malgré des modifications, et échec du découpage naïf des chemins contenant espaces/Unicode. Le dépôt temporaire a été supprimé.
- Consultation réelle de quatre aides de la CLI compilée : `recovery inspect`, `recovery publication`, `recipe serve`, `recipe run`. Vérifications ciblées dans le code de préparation des candidats, choix de branche et transfert Git.
- Formatage et vérification des fichiers de revue, couverture des inventaires et contrôle des liens locaux du rapport.

Aucun appel payant, aucune connexion à un service externe, aucune exécution d’agent réel et aucune vérification de publication npm n’ont été réalisés. Les suites build/docs déjà exécutées lors de la refonte précédente n’ont pas été relancées pour cet ajout de rapports uniquement ; elles ne sont pas présentées comme un nouveau résultat de cette revue.

## Limites de cette revue

L’audit du Guide est page par page ; la prose française a reçu la lecture la plus approfondie. La prose anglaise a été comparée de façon ciblée, pas relue intégralement mot à mot. L’API a reçu un inventaire exhaustif et des contrôles sémantiques ciblés, pas une certification de chaque champ des 723 contrats. Les faits liés à des fournisseurs externes et les releases historiques n’ont pas été revérifiés en ligne.

Les propositions restent à appliquer et les défauts sont encore présents dans le site du worktree. Le rapport permet de choisir un lot concret sans confondre « relu », « compilé » et « exécuté de bout en bout ».
