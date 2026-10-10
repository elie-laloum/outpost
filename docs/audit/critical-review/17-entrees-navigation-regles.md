# Lot 17 — Points d’entrée, navigation et règles éditoriales

[Retour à la synthèse](README.md).

## Accueil EN et FR — P2

L’exemple README est accessible et les prérequis sont maintenant explicites. Il reprend cependant presque intégralement le premier tutoriel. Autour de lui, histoire illustrée, cartes de capacités et choix de la suite reconstituent plusieurs catalogues. Le premier résultat est concurrencé par les possibilités futures.

**Conserver :** promesse simple, lien installation, petit exemple et résultat attendu. **Réduire :** cartes répétées et liens vers le workflow de développement complexe dès l’illustration d’accueil. Proposer le choix TypeScript/YAML plus tôt. Le canvas d’accueil a le même problème mobile que les autres : voir [lot 16](16-canvas.md).

Sources : [EN](../../src/content/docs/index.md), [FR](../../src/content/docs/fr/index.md).

## README — P2

La présentation et les limites sont claires. Le démarrage demande encore de réparer des tests en échec, alors que l’accueil et le Guide commencent par une relecture de README. Un lecteur sans test cassé ne suit donc pas le même premier parcours. L’extrait inclut aussi un reporter avant le simple résultat que montre le site.

**Proposition :** unifier le premier résultat et son nom de branche entre README, accueil et Guide. Garder une table de suites courte. La mention des fichiers non publiés est honnête, mais le lecteur ne sait pas comment obtenir la révision compatible s’il veut les essayer.

Source : [README.md](../../../README.md).

## Navigation Guide — P2

Les 14 groupes sont plus utiles que l’ancien catalogue. Il reste 118 pages par langue, et certaines différences de groupes ne correspondent pas encore à une intention claire du lecteur : « Exécuter et examiner » inclut les traces élémentaires, « Stocker et suivre » leurs variantes ; reprises et récupération se répartissent sur plusieurs groupes. Ce n’est pas une raison pour tout fusionner, mais il manque des choix rapides aux frontières.

Les pages d’orientation doivent aider à choisir sans répéter cartes, matrice et liste de capacités. Une page liée doit réellement répondre au sujet promis : plusieurs liens restent vers `workspaces`, `job-queues`, `budgets` ou `observability` alors qu’une nouvelle page précise existe.

**Proposition de parcours :**

1. Premier résultat : installation → README → vérifier le travail laissé → deux tâches.
2. Faire une modification fiable : branche nommée → préparer les dépendances → exécuter un test → boucle de correction.
3. Reprendre : checkpoint ordinaire → question ou approbation → arrêt brutal et récupération, dans cet ordre.
4. Exploiter : file locale complète → worker → HTTP/Redis → cron ou webhook.
5. Personnaliser : agent/configuration ou harness/outils, avec les détails avancés après un résultat.

YAML doit proposer le même ordre d’apprentissage, avec un fichier complet évoluant progressivement. Tutoriels, procédures et explications peuvent être identifiés par leur introduction et leur place ; aucun troisième espace de navigation n’est nécessaire.

Source : [navigation.mjs](../../scripts/navigation.mjs).

## Navigation API — P2

Les 673 symboles publics sont regroupés en 31 familles ; Harness en contient 95. Le classement ne remplace pas un lien par tâche depuis le Guide. Conserver fonctions avant types/interfaces et les URL existantes, mais ajouter des liens contextuels vers les symboles exacts.

La référence est structurellement détaillée ; le problème prioritaire est l’exactitude des variantes et non un changement de barre latérale. Voir [lot API](15-api.md).

## Liens et redirections — P2

Les anciennes ancres préservées protègent les liens existants. En revanche, **31 annonces visibles de déplacement** restent dans les pages françaises, souvent après une liste « Pour continuer » qui pointe déjà vers la destination. Certaines sont des auto-liens.

**Proposition :** conserver les ancres et redirections, les placer près d’un renvoi utile déjà présent, et supprimer les annonces répétées. Revoir la destination sémantique des liens : une URL valide ne garantit pas que la page répond à la question. Exemple confirmé en FR : `working-with-files` annonce une publication dans la section suivante, qui décrit maintenant un montage ; l’EN a déjà un lien direct.

Ne pas régénérer ou retirer les redirections pendant un audit. Toute correction ultérieure devra vérifier les URL et les ancres historiques.

## Changelog EN/FR — P2

L’espace séparé et l’exclusion de la recherche/pagination conviennent. La lecture de la section Unreleased montre encore un journal de réalisation : « sept lots », parité, fixtures, reçus internes, nombreux termes non expliqués. Les versions passées sont structurées par version, mais restent difficiles à utiliser pour décider d’une migration.

**Proposition :** pour les prochaines notes, séparer ce qui change pour l’utilisateur, l’action de migration et les limites connues. Ne pas réécrire silencieusement les affirmations historiques ni déduire une publication de la présence locale du code. La vérification effectuée ici porte sur l’organisation et les notes récentes, pas sur la preuve de chaque release historique.

Sources : [EN](../../src/content/docs/project/changelog.md), [FR](../../src/content/docs/fr/project/changelog.md), [CHANGELOG.md](../../../CHANGELOG.md).

## SECURITY.md — P2

Le contenu préserve des limites essentielles, mais la page est une succession de longs paragraphes. Le moyen de signalement est vague (« canal s’il est activé », profil du mainteneur), et « V1 receives fixes » ne définit pas clairement le support pour un lecteur de la version actuelle du dépôt.

**Proposition :** sections par frontière, coordonnées concrètes de signalement et politique de versions maintenues explicite. Le mot `local()` est aussi un ancien nom à aligner avec `createLocalSandboxProvider()`. Cette revue n’a pas vérifié un canal externe de signalement.

Source : [SECURITY.md](../../../SECURITY.md).

## Français et anglais — P2

Les 118 paires de pages existent. Les blocs de code sont identiques dans 109 paires ; les neuf différences relevées concernent commentaires, textes de démonstration ou consignes traduites, sans différence structurelle observée. [Détail de la comparaison](evidence/bilingual-code.json).

Le français demande encore une vraie révision éditoriale : « relancer une erreur » est ambigu entre propagation et retry ; « settled », « bindings », « caller », « provider », « sink », « fixture » et « scope » restent fréquents. Les paragraphes ajoutés aux modes fichiers sont particulièrement difficiles. Il faut nommer l’action et sa conséquence : fichiers synchronisés et conservés, montage, appelant, récepteur d’événements.

Les observations page par page viennent d’une lecture intégrale de la prose française et de vérifications ciblées des pages anglaises, notamment tous les défauts prioritaires. La comparaison automatique des exemples ne certifie pas à elle seule l’équivalence de toute la prose anglaise.

## Règles éditoriales et validations — P1/P2

La règle de **20 lignes par extrait** produit un mauvais effet dans les exemples longs : 18 fichiers nommés pour préparer les tests, 18 pour la revue sur label, 21 pour la modification entre dépôts. Le lecteur paie les imports et l’assemblage au lieu d’apprendre plus vite.

**Proposition :** conserver des extraits courts pour expliquer une étape, mais rendre le projet complet disponible et permettre un fichier cohérent plus long lorsque le découpage n’apporte aucune responsabilité réelle. Ne pas confondre découpage des pages et multiplication des fichiers de code.

La consigne d’avoir une explication auprès de chaque bloc a parfois produit des phrases mécaniques (« le schéma explicite décrit le JSON… », répétées dans plusieurs exemples). Une explication doit donner une raison de faire ou un résultat à constater.

La compilation des snippets ne détecte ni module importé qui appelle un modèle, ni helper laissé avec `throw new Error`, ni lecture incomplète d’un diff Git. Les exemples annoncés comme complets doivent être essayés par leur point d’entrée, dans un environnement jetable, avec un résultat vérifié et des dépendances explicitement simulées quand nécessaire.

Sources : [guide-style.md](../guide-style.md), [check-examples.mjs](../../scripts/check-examples.mjs). Les tests de documentation existants restent utiles ; leur réussite ne clôt pas une revue de compréhension ni une validation réelle des services externes.
