# Lot 13 — Exemples complets

C’est le lot qui demande le plus de travail. Les exemples sont longs surtout parce qu’ils sont morcelés ; certains ne sont pas complets, et les trois leçons de développement ne poursuivent pas la même exécution.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Réparer une CI en échec — P2

[Français](../../src/content/docs/fr/guide/fix-failing-ci.md) · [English](../../src/content/docs/guide/fix-failing-ci.md)

**Sections à reprendre :** Écrire le script / Comprendre les étapes.

**Constat.** Huit fichiers pour une boucle corriger/tester et le schéma arrive après le code. Le catalogue initial des six fonctions ralentit l’entrée.

**Action proposée.** Placer objectif, prérequis et boucle avant le code ; fournir un projet téléchargeable ou un script complet, garder les variantes à part.

**Plan examiné :** Ce que montre l’exemple · Écrire le script · Comprendre les étapes · Adapter l’exemple.

**Repères :** 8 fichiers nommés dans les extraits, variantes comprises ; 217 lignes EN / 219 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Clarifier et approuver une modification — P2

[Français](../../src/content/docs/fr/guide/plan-a-change.md) · [English](../../src/content/docs/guide/plan-a-change.md)

**Sections à reprendre :** Répondre / Relire puis décider / Suite.

**Constat.** Le parcours fonctionne conceptuellement et expose une vraie décision humaine. Il exige dix fichiers. La suite ne reprend pas le plan obtenu : un nouveau graphe exige un nouveau checkpoint et une nouvelle planification.

**Action proposée.** Proposer soit un exemple complet dès le départ, soit des leçons autonomes clairement annoncées ; éviter « continuer le plan » si la suite le recrée.

**Plan examiné :** Clarifier le ticket et approuver le plan · Enregistrer la progression et démarrer · Répondre à une question · Relire puis décider.

**Repères :** 10 fichiers nommés dans les extraits, variantes comprises ; 189 lignes EN / 189 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Préparer les tests d’une modification — P1

[Français](../../src/content/docs/fr/guide/prepare-change-tests.md) · [English](../../src/content/docs/guide/prepare-change-tests.md)

**Sections à reprendre :** Écrire et vérifier les tests / Démarrer.

**Constat.** 18 fichiers nommés plus cinq repris de la planification pour une seule leçon ; verdict.ts sert seulement à la suivante. changedFiles découpe git status avec slice(3) : les noms contenant espaces ou Unicode restent cités/échappés et ne correspondent plus aux vrais chemins.

**Action proposée.** Fournir le projet entier, retirer les dépendances inutiles et tester le parseur sur noms avec espaces, Unicode et renommages ; séparer essai terminal et intégration applicative.

**Vérification.** Reproduction dans un dépôt Git temporaire : test/a b.test.ts et test/été.test.ts produisent deux chemins invalides avec le parseur de git.ts. Voir [reproduction Git](evidence/git-proof.json).

**Plan examiné :** Préparer et réutiliser la sandbox · Écrire et vérifier les tests · Démarrer le workflow de tests · Répondre et approuver · Examiner le résultat.

**Repères :** 18 fichiers nommés dans les extraits, variantes comprises ; 315 lignes EN / 315 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Créer un workflow de développement — P2

[Français](../../src/content/docs/fr/guide/development-workflow.md) · [English](../../src/content/docs/guide/development-workflow.md)

**Sections à reprendre :** Écrire le script / Comprendre les étapes.

**Constat.** Réutilise de nombreux fichiers de deux autres pages mais recopie start/answer/decide/run. Les deux canvas montrent des phases locales sans flèche de raccord ni refus d’approbation/épuisement. « Les agents ne commitent jamais » est contredit par la caution.

**Action proposée.** Présenter un graphe global puis zoomer les boucles ; fournir une arborescence complète et des commandes réponse/décision. Écrire que le brief demande de ne pas committer, et distinguer reprise d’exécution et leçon suivante.

**Plan examiné :** Écrire le script · Comprendre les étapes · Adapter l’exemple · Limites.

**Repères :** 13 fichiers nommés dans les extraits, variantes comprises ; 314 lignes EN / 316 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Développer depuis un ticket Linear — P2

[Français](../../src/content/docs/fr/guide/recipe-linear-development.md) · [English](../../src/content/docs/guide/recipe-linear-development.md)

**Sections à reprendre :** Préparer / Lancer depuis la CLI.

**Constat.** Scénario concret plus directement utilisable que les recettes TypeScript éclatées. Mais il part du dépôt source, utilise outpost:sandbox et npm link alors que setup enseigne un paquet installé et outpost:dev.

**Action proposée.** Annoncer immédiatement le parcours contributeur/local non publié, harmoniser l’image ou donner sa construction exacte ; fournir les résultats attendus des commandes de préparation.

**Plan examiné :** Préparer l’application · Lancer depuis la CLI · Choisir et valider le travail · Reprendre ou traiter un autre ticket.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 58 lignes EN / 58 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Examiner une pull request à la demande — P1

[Français](../../src/content/docs/fr/guide/review-on-label.md) · [English](../../src/content/docs/guide/review-on-label.md)

**Sections à reprendre :** github-effects.ts / Exécuter le script.

**Constat.** Sous Exemples complets, fetchCommits et postVerdict sont laissés à fournir : le lecteur ne peut pas obtenir la revue publiée en copiant les fichiers. Plus de 400 lignes et dix-huit fichiers masquent ce prérequis.

**Action proposée.** Fournir une intégration réellement exécutable ou renommer explicitement en patron d’intégration ; commencer par recevoir un événement signé et lire un verdict local, puis ajouter la publication idempotente.

**Plan examiné :** Ce que montre l’exemple · Écrire le script · Comprendre les étapes · Adapter l’exemple · Limites.

**Repères :** 18 fichiers nommés dans les extraits, variantes comprises ; 408 lignes EN / 410 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Planifier une maintenance nocturne — P2

[Français](../../src/content/docs/fr/guide/nightly-maintenance.md) · [English](../../src/content/docs/guide/nightly-maintenance.md)

**Sections à reprendre :** Planifier / Exécuter / Limites.

**Constat.** Treize fichiers pour un résultat attendu la nuit ; aucune commande de déclenchement immédiat. Le passage Redis/CI sous-estime la conservation du workspace de reprise.

**Action proposée.** Ajouter une soumission immédiate de test et le chemin du rapport ; séparer installation du service et adaptations. Préciser reprise gracieuse vs crash et présence du workspace.

**Plan examiné :** Ce que montre l’exemple · Planifier les nuits · Exécuter le workflow · Comprendre les étapes · Adapter l’exemple · Limites.

**Repères :** 13 fichiers nommés dans les extraits, variantes comprises ; 311 lignes EN / 313 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Coordonner une modification entre dépôts — P2

[Français](../../src/content/docs/fr/guide/multi-repository-change.md) · [English](../../src/content/docs/guide/multi-repository-change.md)

**Sections à reprendre :** Écrire / Exécuter / Adapter.

**Constat.** Plus de 400 lignes, 21 fichiers nommés et plusieurs schémas/validateurs pour une seule opération. La variante review ajoute encore cinq fichiers. Le résultat et la fusion non atomique sont pourtant bien expliqués.

**Action proposée.** Fournir un projet complet avec trois dépôts temporaires ; enseigner le graphe et la relecture avant les helpers, extraire la variante revue. Vérifier les commits approuvés juste avant chaque fusion.

**Plan examiné :** Ce que montre l’exemple · Écrire le script · Comprendre les étapes · Quand un dépôt échoue · Adapter l’exemple.

**Repères :** 21 fichiers nommés dans les extraits, variantes comprises ; 427 lignes EN / 429 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Comparer les approches des agents — P2

[Français](../../src/content/docs/fr/guide/compete-agents.md) · [English](../../src/content/docs/guide/compete-agents.md)

**Sections à reprendre :** Écrire / Adapter / Reprendre.

**Constat.** La première version compose déjà sélection, prompt humain et merge en huit fichiers ; deux autres modes plus durabilité recréent speculation et resuming-speculation.

**Action proposée.** Garder une compétition testée jusqu’à branche gagnante ; proposer la fusion comme étape distincte et lier le guide de reprise dédié, sans recopier durability.

**Plan examiné :** Ce que montre l’exemple · Écrire le script · Comprendre les étapes · Adapter l’exemple · Limites.

**Repères :** 16 fichiers nommés dans les extraits, variantes comprises ; 357 lignes EN / 359 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
