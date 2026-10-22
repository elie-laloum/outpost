---
title: "Éditer une recette visuellement"
description: "Construire, vérifier et exécuter une recette YAML depuis un éditeur web local."
---

`outpost recipe editor` ouvre une application web locale qui édite votre recette et votre configuration d’exécution sous forme de graphe de tâches, les vérifie pendant la saisie et les exécute. Elle écrit les mêmes fichiers YAML que vous éditeriez à la main : l’éditeur et votre éditeur de texte peuvent travailler à tour de rôle sur un même projet.

## Lancer l’éditeur

Lancez la commande depuis le dossier qui contient votre recette, ou indiquez-le avec `--directory`. L’éditeur ne sert que ce dossier et ouvre votre navigateur sur une adresse de boucle locale.

```sh
npx outpost recipe editor --file recipe.yaml --config outpost.yaml
```

Le terminal affiche l’adresse, par exemple `http://127.0.0.1:41873/#token=…`, et garde l’éditeur actif jusqu’à Ctrl+C. Si les fichiers n’existent pas encore, la boîte d’ouverture propose des modèles de départ, comme des commandes locales dans un workspace temporaire ; rien n’est écrit avant l’enregistrement. La [référence des commandes de recettes](../recipe-cli/#outpost-recipe-editor) liste les options.

## Éditer le graphe et le YAML

La barre d’outils passe d’une vue à l’autre sur les mêmes brouillons. Chaque vue valide les brouillons après chaque modification et liste les problèmes dans la barre d’état.

| Vue           | Ce que vous y faites                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Canvas        | Ajouter des tâches depuis la palette, relier les dépendances, renommer les tâches et éditer leurs options. |
| Recipe YAML   | Éditer directement le texte de la recette ; les problèmes sont soulignés à leur ligne.                     |
| Configuration | Éditer workspace, sandbox, agents, environnement et extensions par formulaires, ou l’ensemble du YAML.     |
| Plan          | Lire le plan statique que `outpost recipe plan` afficherait pour les brouillons non enregistrés.           |
| Runs          | Lancer, suivre, arrêter et reprendre des exécutions, et répondre à ce qu’elles attendent.                  |

Les modifications du canvas et des formulaires ne réécrivent que les valeurs YAML concernées : commentaires, ordre des clés et mise en forme restent inchangés ailleurs. Les nouvelles tâches sont placées automatiquement ; dès que vous déplacez un nœud, sa position est enregistrée dans `recipe.editor.json` à côté de la recette, fichier que vous pouvez versionner ou ignorer. Ctrl+Z annule une modification, Ctrl+Maj+Z la rétablit et Ctrl+S enregistre les deux fichiers. Si un fichier change sur le disque pendant l’édition, l’éditeur propose de le recharger et ne le remplace qu’après votre confirmation.

Le canvas et les formulaires éditent le format de recette 3 et la version de configuration 3. Les autres formats s’ouvrent en lecture seule sur le canvas et restent modifiables dans les vues YAML. Une chaîne simple écrite sur plusieurs lignes est remise sur une seule ligne lorsqu’une édition structurée réécrit le fichier ; entourez-la de guillemets ou utilisez un bloc (`|` ou `>`) pour garder ses retours à la ligne.

## Ajouter et vérifier des extensions

La page Extensions de la configuration liste les [extensions](../recipe-extensions/) déclarées et leurs modules. New extension déclare `extensions.<nom>` pour le type et le contrat choisis, ajoute si besoin un alias `functions.<nom>` pour les tâches d’appel et de boucle, et crée le module avec un export de départ lorsque le fichier n’existe pas. Sélectionnez une extension pour éditer son module, puis enregistrez-le avec Ctrl+S.

La validation n’importe jamais les extensions. Verify enregistre les brouillons, lance cette commande dans un processus séparé et indique les extensions chargées ou le premier export refusé :

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml --extensions
```

La vérification exécute le code de chaque module déclaré, comme le ferait une exécution. Réservez-la aux modules auxquels vous faites confiance.

## Exécuter et suivre une recette

Run enregistre les brouillons, demande les entrées de la recette et lance `outpost recipe run` sur les fichiers enregistrés dans un processus séparé. L’exécution utilise la sandbox et les agents de votre configuration : elle peut modifier des fichiers et consommer des modèles exactement comme la même commande dans un terminal.

Pendant l’exécution, chaque tâche du canvas affiche son statut et la vue Runs affiche le journal des événements. Stop demande l’annulation : la CLI libère sa sandbox et se termine avec le statut 143 ; un second arrêt termine le processus. Sous Windows, Stop termine le processus immédiatement. Une seule exécution est active à la fois.

Chaque exécution est conservée dans `.outpost/editor/runs/` avec ses événements, son rapport final et sa sortie d’erreur. L’éditeur écrit un `.gitignore` dans `.outpost/editor/` pour tenir cet historique hors de Git.

## Répondre aux questions et aux approbations

Une [recette durable](../recipe-durability/) qui se met en pause conserve son état dans le checkpoint. Lorsqu’une exécution s’arrête sur une question de dialogue ou une étape d’approbation non signée, la vue Runs l’affiche sous Waiting for you. Répondre, approuver ou refuser lance `outpost recipe answer` ou `outpost recipe decide` avec le même identifiant d’exécution ; Resume reprend une exécution, en rejouant si besoin les tâches interrompues.

Une approbation signée exige une décision accompagnée de sa preuve. L’éditeur affiche la commande `outpost recipe decide` qui la soumet ; il ne crée ni ne contourne jamais cette preuve. Une recette sans `workflow.checkpoint` ne peut pas être reprise : ses questions restent visibles, mais l’exécution doit recommencer.

## Ce que l’éditeur peut atteindre

L’éditeur est destiné à la personne qui le lance, sur la même machine. Il n’écoute que sur `127.0.0.1`, sur un port aléatoire sauf si vous en choisissez un. Chaque lancement crée un jeton aléatoire porté par le fragment de l’adresse ; la page l’envoie avec chaque requête, et les requêtes d’un autre hôte ou d’une autre origine sont refusées. Traitez l’adresse comme un mot de passe tant que l’éditeur tourne.

Les lectures et écritures restent dans le dossier de l’éditeur : les chemins contenant `..`, les liens symboliques qui en sortent et `.git` sont refusés. L’édition n’exécute jamais votre code. Le code ne s’exécute que lorsque vous vérifiez les extensions ou lancez une exécution, et les événements n’atteignent la page qu’après que l’exécution a masqué les secrets qu’elle a résolus.
