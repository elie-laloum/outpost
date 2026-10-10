# Lot 01 — Premiers pas

Le meilleur lot pour commencer. Garder ce parcours ; compléter surtout la vérification des fichiers réellement laissés par la première tâche.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Commencer avec Outpost — P3

[Français](../../src/content/docs/fr/guide/introduction.md) · [English](../../src/content/docs/guide/introduction.md)

**Sections à reprendre :** Obtenir un premier résultat.

**Constat.** Le parcours recommandé est net. La dernière section réintroduit agent, sandbox, workspace et harness alors que le début promet une première tâche.

**Action proposée.** Conserver la page ; garder trois notions et renvoyer le détail des harness à l’explication.

**Plan examiné :** Obtenir un premier résultat · Choisir la suite · Comprendre ce que vous contrôlez.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 46 lignes EN / 46 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Installer Outpost — P3

[Français](../../src/content/docs/fr/guide/setup.md) · [English](../../src/content/docs/guide/setup.md)

**Sections à reprendre :** Construire l’image des agents.

**Constat.** Le parcours est maintenant cohérent et précise que init crée aussi des fichiers d’exemple. Il reste deux emplacements à distinguer : image et scripts du lecteur.

**Action proposée.** Conserver les étapes ; ajouter un arbre final des deux emplacements si les retours lecteurs confirment cette hésitation, sans réexpliquer init.

**Plan examiné :** Avant de commencer · Installer le paquet · Construire l’image des agents · Préparer l’accès à l’agent · Enregistrer la configuration · Vérifier l’image.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 65 lignes EN / 65 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Votre première tâche — P1

[Français](../../src/content/docs/fr/guide/first-request.md) · [English](../../src/content/docs/guide/first-request.md)

**Sections à reprendre :** Exécuter et examiner le résultat.

**Constat.** La vérification proposée est git diff HEAD...branche : elle ne voit pas les modifications non commitées ou non suivies du worktree. Elle ne suffit donc pas à vérifier la consigne de lecture seule.

**Action proposée.** Montrer séparément les commits et le statut du worktree conservé, avec son chemin ; ne pas présenter le diff de commits comme une vérification exhaustive.

**Vérification.** Reproduction Git temporaire : git diff HEAD...outpost/readme-review vide malgré README modifié et deux fichiers non suivis. Voir [reproduction Git](evidence/git-proof.json).

**Plan examiné :** Demander une revue du README · Exécuter et examiner le résultat · Continuer à partir du résultat.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 61 lignes EN / 61 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Votre premier workflow — P3

[Français](../../src/content/docs/fr/guide/first-workflow.md) · [English](../../src/content/docs/guide/first-workflow.md)

**Sections à reprendre :** Comprendre la dépendance.

**Constat.** Le résultat et l’ordre des tâches sont compréhensibles. Les précisions sur les checkpoints arrivent alors que le lecteur n’en utilise pas.

**Action proposée.** Conserver les trois fichiers et le résultat visible ; réduire le paragraphe checkpoint à un lien de suite contextualisé.

**Plan examiné :** Transmettre la réponse de l’agent à votre code · Lancer le workflow · Comprendre la dépendance · Aller plus loin.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 83 lignes EN / 83 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Comment Outpost exécute une tâche — P2

[Français](../../src/content/docs/fr/guide/how-it-works.md) · [English](../../src/content/docs/guide/how-it-works.md)

**Sections à reprendre :** De la demande au nettoyage.

**Constat.** Bonne distinction des durées de vie. Le canvas reste une chaîne de cinq étapes avec deux lignes d’acteurs, assez longue sur mobile ; le traitement des échecs n’y apparaît qu’à la dernière flèche.

**Action proposée.** Garder l’explication ; préciser que le schéma montre le chemin nominal et que le nettoyage intervient aussi après un échec antérieur.

**Plan examiné :** Agent, sandbox et workspace · De la demande au nettoyage · Garder un environnement ouvert · Retrouver le travail.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 57 lignes EN / 57 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
