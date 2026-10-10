# Lot 16 — Canvas : contenu et lisibilité

[Retour à la synthèse](README.md).

Les boucles et embranchements sont plus compréhensibles qu’avant, mais les canvas ne sont pas encore satisfaisants. Deux problèmes distincts demeurent : le texte est trop petit sur mobile, et plusieurs schémas n’expliquent pas mieux le système qu’une courte procédure.

## P1 — Le texte mobile est illisible à l’ouverture

Mesure dans Chromium, sur le serveur du worktree, avec des fenêtres de **390 × 900** et **1440 × 900**, dans les deux langues. Les 16 canvas du Guide sont répartis sur 15 pages ; l’accueil contient un canvas supplémentaire.

| Vue initiale    | Guide EN + FR | Texte descriptif après mise à l’échelle | Débordement du graphe hors de son cadre |
| --------------- | ------------: | --------------------------------------- | --------------------------------------- |
| 390 px          |     32 canvas | Environ 6,13 px pour tous               | 32 sur 32                               |
| 1440 px         |     32 canvas | De 10,09 à 12,25 px                     | Aucun                                   |
| Accueil, 390 px |      2 canvas | Environ 6,13 px                         | 2 sur 2                                 |

Le débordement est interne au canvas, pas à la page entière. Il oblige néanmoins à déplacer le graphe avant d’en comprendre le parcours. Le bouton de zoom ne compense pas une première vue illisible ; il agrandit aussi la partie hors champ.

La constante `CANVAS_READABLE_SCALE = 0.5` est nommée « lisible », mais elle réduit le texte de 12,25 px à environ 6 px. La mesure du DOM et l’inspection des captures confirment le problème.

- [Développement sur mobile](evidence/development-workflow-390.png) : même trois nœuds produisent du texte minuscule et une dernière carte coupée.
- [Plusieurs dépôts sur grand écran](evidence/multi-repository-change-1440.png) : l’embranchement et la convergence se comprennent beaucoup mieux.
- [Mesures complètes du Guide](evidence/canvas.json) et [mesures des points d’entrée](evidence/entry-browser.json).

**Correction proposée :** une présentation verticale à taille de texte normale sur mobile, avec les branches et retours explicités ; garder le canvas interactif comme vue complémentaire lorsque le graphe le justifie. Mesurer la taille réellement affichée, pas seulement le pourcentage de zoom. Faire le même contrôle en français, dont les libellés sont souvent plus longs.

## Retour sur chaque schéma

| Page / section                              | Ce qui aide                                               | Ce qui reste à changer                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil — Relier le résultat                | Trois actions et résultat transmis.                       | Une procédure ou une illustration statique suffit ; pas besoin de déplacement/zoom pour découvrir trois étapes.                                   |
| Fonctionnement — De la demande au nettoyage | Les responsabilités Outpost/agent et les durées de vie.   | Préciser chemin nominal et nettoyage après erreur. Le FR nomme l’échec sur la dernière flèche, l’EN seulement la fin ; harmoniser le sens.        |
| Synchronisation distante                    | Le refus des changements concurrents mène à récupération. | Expliquer que l’application met à jour le workspace de travail ; elle ne signifie pas nécessairement fusion dans la branche du lecteur.           |
| Boucles de vérification                     | Retour de correction et sortie par épuisement.            | Bon candidat à conserver. Nommer le retour transmis, par exemple « tests échoués + diagnostic », dans les exemples concrets.                      |
| Approbations                                | L’embranchement approuvé/refusé.                          | Distinguer workflow, application et personne ; la ligne « Exécution » commune ne le fait pas.                                                     |
| Questions de l’agent                        | Boucle question/réponse et résultat final.                | Rendre visible la fermeture de sandbox avant attente et sa réouverture au prochain tour ; ne pas enfouir ces deux effets dans une carte.          |
| Quota                                       | Différence attente dans le processus / pause enregistrée. | Remplacer « attente possible/exclue » par la condition utile : date connue dans la fenêtre autorisée, sinon retour au caller.                     |
| Jobs et workers                             | Producteur → traitement → résultat.                       | La file partagée est absente comme élément distinct ; une vue avec les deux processus expliquerait mieux le sujet.                                |
| Webhooks                                    | Requête refusée ou mise en file, puis worker séparé.      | La signature n’est qu’un contrôle ; montrer aussi événement ignoré et acteur non autorisé, au moins dans la légende.                              |
| Sous-agents                                 | Transmission du prompt et du résultat.                    | Montrer sandbox partagée et historiques séparés. Trois cartes en ligne n’expliquent pas la différence avec des tâches isolées.                    |
| Réparer une CI                              | Boucle réelle, succès et limite de tours.                 | Placer le schéma avant les huit fichiers ; remplacer « prêt à vérifier » par les éléments effectivement contrôlés.                                |
| Développement — Préparation                 | Plan, approbation, tests.                                 | Ajouter le refus du plan et indiquer où mène la sortie Tests. Le second canvas n’est pas relié visuellement au premier.                           |
| Développement — Réalisation                 | Correction après échec de contrôle.                       | Ajouter l’épuisement et le travail conservé ; distinguer consigne de non-commit et contrôle effectivement imposé.                                 |
| Revue sur label                             | Parcours de l’événement au verdict.                       | « Mettre en file » décrit déjà le worker ; séparer publication et réservation. Le schéma promet une publication que le code laisse à implémenter. |
| Maintenance nocturne                        | Branche quota et job de reprise.                          | Séparer planificateur et worker ; ne pas suggérer que le timer attend ou exécute lui-même la tâche.                                               |
| Plusieurs dépôts                            | Parallélisme web/mobile et convergence avant approbation. | Bon candidat à conserver. Rendre explicite la fusion successive, non atomique, et le cas d’une intégration partielle.                             |
| Compétition d’agents                        | Validation avant sélection puis accord humain.            | Deux candidats sont condensés dans une seule carte ; montrer au moins les branches concurrentes et le cas sans gagnant.                           |

## Règles de contenu proposées

Un schéma doit répondre à une question que le texte seul rend difficile : qui exécute, où l’état attend, ce qui se passe en cas de refus, ou ce qui est partagé. La même étiquette « Exécution » sur tous les nœuds n’ajoute pas cette information.

Éviter les titres nominaux sans effet visible, les longues descriptions de contrats dans les cartes et la phrase répétée « Chaque lien indique qui transmet quoi à qui ». Écrire la condition ou la donnée sur la flèche. Placer le schéma avant les fichiers lorsqu’il explique leur assemblage.

Les contrôles de cette revue portent sur le rendu initial, les dimensions et le contenu. Ils ne remplacent pas une nouvelle campagne d’accessibilité clavier/lecteur d’écran après modification du composant.
