# Lot 12 — Créer une boucle d’agent

Le lot couvre les capacités du harness, sans toujours permettre de les essayer. Séparer sélection d’outils, création d’outil et hooks ; montrer les résultats avant les détails internes.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Créer votre propre boucle d’agent — P2

[Français](../../src/content/docs/fr/guide/harness.md) · [English](../../src/content/docs/guide/harness.md)

**Sections à reprendre :** Observer la boucle / Router chaque étape.

**Constat.** Le premier agent lisant seulement des fichiers donne un vrai résultat. Puis trois nouveaux fichiers répètent modèle/agent/dispatch pour observation ; le routage arrive après Limites et API.

**Action proposée.** Garder le premier parcours avec limites et outils ; transformer observation en modification courte de l’exemple, déplacer le routage dans les suites.

**Plan examiné :** Choisir la boucle intégrée · Lancer une tâche · Étapes de la boucle · Limiter un échange avec le modèle · Observer la boucle · Aller plus loin · Limites · Router chaque étape de modèle.

**Repères :** 6 fichiers nommés dans les extraits, variantes comprises ; 181 lignes EN / 181 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Connecter une API de modèle — P2

[Français](../../src/content/docs/fr/guide/model-providers.md) · [English](../../src/content/docs/guide/model-providers.md)

**Sections à reprendre :** Limiter la durée / Connecter une autre API.

**Constat.** La distinction Codex/ModelProvider est utile. La section durée ne montre aucun réglage et parle d’expiration sans expliquer d’abord délai d’inactivité vs durée totale.

**Action proposée.** Montrer un réglage de timeout avec son effet et le lien vers deadline du dispatch ; déplacer l’implémentation d’un provider dans Étendre Outpost.

**Plan examiné :** Connecter un modèle · Choisir un protocole · Utiliser un service local · Conserver la clé sur la machine hôte · Régler le modèle et son raisonnement · Diffuser le texte au fil de l’eau · Limiter la durée des requêtes · Mettre en cache le préfixe du prompt · Réessayer après une limite de débit ou une panne · Connecter une autre API · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 114 lignes EN / 114 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Donner des outils au modèle — P2

[Français](../../src/content/docs/fr/guide/harness-tools.md) · [English](../../src/content/docs/guide/harness-tools.md)

**Sections à reprendre :** Définir un outil / Regrouper des outils.

**Constat.** Neuf fichiers pour sélectionner puis créer puis regrouper des outils ; le custom run_tests est déclaré mais pas relié à l’agent dans un exemple complet.

**Action proposée.** Séparer choisir des outils intégrés et créer son premier outil ; montrer l’ajout à tools puis un appel observé, déplacer les règles de noms dans l’API.

**Plan examiné :** Donner des outils prêts à l’emploi au modèle · Choisir les ensembles d’outils · Définir un outil · Regrouper des outils · Utiliser les outils d’un serveur MCP · Workspaces de fichiers · Limites.

**Repères :** 9 fichiers nommés dans les extraits, variantes comprises ; 185 lignes EN / 185 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Contrôler les permissions des outils — P2

[Français](../../src/content/docs/fr/guide/harness-permissions.md) · [English](../../src/content/docs/guide/harness-permissions.md)

**Sections à reprendre :** N’autoriser que ce dont la tâche a besoin / Hooks.

**Constat.** Quatre fichiers pour la politique puis trois pour les hooks. Le guide demande de tester autorisé/refusé mais ne donne pas ce test ; les hooks sont un second sujet.

**Action proposée.** Garder une politique et deux appels vérifiables ; traiter hooks et ordre d’exécution sur une page dédiée. Ne pas présenter le refus .env comme protection contre une commande autorisée.

**Plan examiné :** N’autoriser que ce dont la tâche a besoin · Écrire les règles · Intercepter les appels avec des hooks · Ordre des contrôles et des hooks · Appliquer les règles aux sous-agents · Limites.

**Repères :** 7 fichiers nommés dans les extraits, variantes comprises ; 148 lignes EN / 148 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Donner des instructions et des compétences au harness — P3

[Français](../../src/content/docs/fr/guide/harness-skills.md) · [English](../../src/content/docs/guide/harness-skills.md)

**Sections à reprendre :** Écrire les instructions / Charger les compétences.

**Constat.** Page mieux centrée, exemple hors ligne et limites utiles. Le résultat montré inspecte une déclaration, il ne démontre pas le chargement réel par le modèle.

**Action proposée.** Conserver ; nommer cette limite et donner un événement load_skill attendu. Supprimer le double lien API et harmoniser compétences/skills.

**Plan examiné :** Écrire les instructions système · Charger des compétences à la demande · Garder les limites visibles.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 76 lignes EN / 77 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Gérer l’historique de conversation — P2

[Français](../../src/content/docs/fr/guide/harness-context.md) · [English](../../src/content/docs/guide/harness-context.md)

**Sections à reprendre :** Choisir une stratégie.

**Constat.** Le titre promet un choix mais la section donne trois liens puis seulement le coût du résumé. La stratégie personnalisée est plus détaillée que le choix standard.

**Action proposée.** Comparer résumé et réduction des résultats selon le besoin ; montrer un avant/après, repousser le callback personnalisé et supprimer les liens compétences devenus hors sujet.

**Plan examiné :** Limiter la taille de l’historique · Choisir une stratégie · Écrire une stratégie personnalisée · Historique réduit et transcription enregistrée · Limites · Pour continuer.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 99 lignes EN / 99 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Déléguer à des sous-agents — P2

[Français](../../src/content/docs/fr/guide/subagents.md) · [English](../../src/content/docs/guide/subagents.md)

**Sections à reprendre :** Déclarer un sous-agent / Limiter le travail.

**Constat.** Cinq fichiers avant une délégation, puis budget/permissions répétés. Le canvas est une simple chaîne de trois étapes et n’explique pas visuellement la sandbox partagée ou les historiques distincts.

**Action proposée.** Garder un exemple complet compact ; remplacer le canvas par une vue parent/enfant partageant un espace de fichiers, ou trois étapes textuelles.

**Plan examiné :** Déclarer un sous-agent comme outil · Entrées et résultats du sous-agent · Limiter le travail délégué · Permissions et hooks · Reprendre une conversation enfant · Suivre et réorienter les sous-agents · Limites.

**Repères :** 5 fichiers nommés dans les extraits, variantes comprises ; 149 lignes EN / 149 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Évaluer une décision typée — P2

[Français](../../src/content/docs/fr/guide/decisions.md) · [English](../../src/content/docs/guide/decisions.md)

**Sections à reprendre :** Déclarer les questions / Exercer hors ligne.

**Constat.** Le début promet un essai hors ligne mais il arrive après trois types de décision, contrat JSON, protocole et workflow. Le lecteur rencontre noul et distributions avant un choix simple.

**Action proposée.** Commencer par un seul choix et son résultat ; placer l’essai hors ligne en premier, isoler scores/probabilités et déplacer tolérances numériques dans l’API.

**Plan examiné :** Déclarer les questions · Connecter Jev ou Laya · Évaluer l’état courant · Traiter les entrées incomplètes et les erreurs · Ajouter une tâche de workflow · Exercer le contrat hors ligne.

**Repères :** 7 fichiers nommés dans les extraits, variantes comprises ; 153 lignes EN / 153 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Router le modèle à chaque étape — P2

[Français](../../src/content/docs/fr/guide/model-routing.md) · [English](../../src/content/docs/guide/model-routing.md)

**Sections à reprendre :** Déclarer le routage / Observer et reprendre.

**Constat.** Quatre fichiers et deux services avant le premier résultat, sans dispatch final ni exemple de sélection affichée. La fin décrit versions de transcripts et accounting.

**Action proposée.** Fournir un scénario complet montrant fast puis deep avec leur motif ; déplacer formats persistés dans l’API et garder coûts, repli et erreurs visibles.

**Plan examiné :** Déclarer le routage · Composer l’agent · Fournir un état utile · Choisir la politique de repli · Observer et reprendre.

**Repères :** 5 fichiers nommés dans les extraits, variantes comprises ; 127 lignes EN / 127 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
