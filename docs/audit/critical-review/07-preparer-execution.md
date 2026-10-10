# Lot 07 — Préparer l’exécution

Les choix de sandbox et la préparation sont accessibles. Secrets et caches cloud demandent un autre découpage ; quelques formulations sur variables et Git transmis contredisent le comportement réel.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Choisir une sandbox — P2

[Français](../../src/content/docs/fr/guide/choose-a-sandbox.md) · [English](../../src/content/docs/guide/choose-a-sandbox.md)

**Sections à reprendre :** Configurer le fournisseur / Comparer les environnements.

**Constat.** Recommande Docker puis donne Vercel comme premier code. Cartes, liste de choix et grande matrice répètent le même choix ; jargon bindings/settled en fin de page.

**Action proposée.** Commencer avec Docker/Podman ; limiter l’orientation aux critères décisifs et garder la matrice technique sous une section avancée.

**Plan examiné :** Environnements disponibles · Choisir selon votre besoin · Configurer le fournisseur · Comparer les environnements · Workspaces de fichiers · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 87 lignes EN / 87 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Utiliser Docker ou Podman — P2

[Français](../../src/content/docs/fr/guide/containers.md) · [English](../../src/content/docs/guide/containers.md)

**Sections à reprendre :** Prérequis / Podman.

**Constat.** « Un dépôt Git » est présenté comme requis alors que les sources de fichiers sont prises en charge. La section SELinux demande de choisir sans donner de critère pratique.

**Action proposée.** Dire que cette procédure utilise Git et lier la variante fichiers ; expliquer brièvement quand choisir le marquage SELinux documenté dans l’API.

**Plan examiné :** Prérequis · Configurer · Accès au dépôt · Podman · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 90 lignes EN / 90 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Construire une image d’agent — P3

[Français](../../src/content/docs/fr/guide/agent-images.md) · [English](../../src/content/docs/guide/agent-images.md)

**Sections à reprendre :** Ajouter des outils de projet / Vérifier l’image.

**Constat.** Page cohérente avec commandes, résultat et limites importantes. Elle constitue une meilleure explication des fichiers générés que setup.

**Action proposée.** Conserver ; faire de setup un chemin court qui s’appuie sur cette page, sans recopier la gestion complète des images.

**Plan examiné :** Contenu de l’image · Générer la recette · Ajouter des outils de projet et reconstruire · Garder les identifiants hors de l’image · Mettre à jour les CLI épinglés · Vérifier l’image · Supprimer l’image · Images des sandboxes distantes · Limites.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 110 lignes EN / 110 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Préparer l’environnement de l’agent — P2

[Français](../../src/content/docs/fr/guide/environment-setup.md) · [English](../../src/content/docs/guide/environment-setup.md)

**Sections à reprendre :** Réinstaller seulement quand les fichiers changent / Cloud.

**Constat.** Installer les dépendances, préparation conditionnelle et deux familles de caches sont trois tâches. La section cloud devient un contrat d’archives et de concurrence avec tailles et fixtures.

**Action proposée.** Scinder préparation et caches de dépendances. Garder par cache configuration, effet, échec et nettoyage ; déplacer formats/limites exactes dans l’API.

**Plan examiné :** Installer les dépendances avant le travail de l’agent · Choisir où s’exécute chaque hook · Préparer une fois pour plusieurs tours · Réinstaller seulement quand les fichiers changent · Réutiliser les téléchargements entre conteneurs · Réutiliser les téléchargements dans le cloud · Gérer les volumes de cache · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 161 lignes EN / 161 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Transmettre des variables d’environnement — P1

[Français](../../src/content/docs/fr/guide/environment-variables.md) · [English](../../src/content/docs/guide/environment-variables.md)

**Sections à reprendre :** Comprendre la priorité des valeurs.

**Constat.** La flèche .env → fournisseur → harness → commande suggère une surcharge du fournisseur par le harness ; l’avertissement suivant dit que ce doublon est interdit. Le contrat réel est expliqué de façon contradictoire.

**Action proposée.** Représenter séparément priorité des sources autorisées et conflit fournisseur/harness ; préciser que .outpost/.env concerne le parcours Git, pas les sources de fichiers.

**Plan examiné :** Choisir où déclarer une variable · Comprendre la priorité des valeurs · Garder des valeurs dans `.outpost/.env` · Charger un fichier dans votre script · Secrets des serveurs MCP et du harness intégré · Hôte ou sandbox · Limites.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 98 lignes EN / 98 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Charger les secrets depuis un service — P2

[Français](../../src/content/docs/fr/guide/secret-sources.md) · [English](../../src/content/docs/guide/secret-sources.md)

**Sections à reprendre :** Utiliser les services / Sélectionner les secrets avant allocation.

**Constat.** Six fournisseurs, source personnalisée, garanties bas niveau et variante YAML tardive : véritable catalogue malgré de bons avertissements. La dernière section renvoie à la page elle-même.

**Action proposée.** Garder une page de choix + résolution commune ; regrouper les recettes par service et isoler YAML. Déplacer validation des noms/tailles et mécanique SDK dans l’API.

**Plan examiné :** Résoudre avant d’allouer une sandbox · Utiliser Vault ou OpenBao · Utiliser 1Password · Utiliser Infisical · Utiliser AWS Secrets Manager · Utiliser Google Cloud Secret Manager · Utiliser Azure Key Vault · Borner le démarrage et renouveler explicitement · Implémenter une autre source · Limites de validation · Sélectionner les secrets avant allocation.

**Repères :** 8 fichiers nommés dans les extraits, variantes comprises ; 219 lignes EN / 219 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter dans le cloud — P1

[Français](../../src/content/docs/fr/guide/cloud-sandboxes.md) · [English](../../src/content/docs/guide/cloud-sandboxes.md)

**Sections à reprendre :** Vercel / Daytona / Workspaces de fichiers.

**Constat.** Liens API doublés immédiatement pour chaque fournisseur ; paragraphes transfert, settled et live difficiles. La préparation du secours contredit fallback-agents.

**Action proposée.** Un seul exemple complet par fournisseur ou onglets alternatifs clairement nommés ; lien vers synchronisation et reprise, vocabulaire lecteur ; aligner le bootstrap.

**Vérification.** src/application/sandbox-dispatch.ts:112 prépare chaque candidat ; src/application/sandbox-agents.ts:28–36 appelle prepareAdapter pour tout candidat distant non préparé.

**Plan examiné :** Prérequis · Vercel Sandbox · Daytona Sandbox · Comparer Vercel et Daytona · Lancer une tâche · Workspaces de fichiers · Limites · Pour continuer.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 127 lignes EN / 127 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exécuter sur votre machine — P3

[Français](../../src/content/docs/fr/guide/host-process.md) · [English](../../src/content/docs/guide/host-process.md)

**Sections à reprendre :** Configurer / Ce qui change.

**Constat.** Une des pages les plus efficaces : risque annoncé, script court, différences concrètes. La matrice répète néanmoins une partie des prérequis et limites.

**Action proposée.** Conserver le parcours ; alléger les répétitions et garder bien visible que account.file ne choisit pas une autre session locale.

**Plan examiné :** Prérequis · Configurer · Ce qui change par rapport à un conteneur · Accès au dépôt · Limites.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 61 lignes EN / 61 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Utiliser Firecracker — P2

[Français](../../src/content/docs/fr/guide/firecracker.md) · [English](../../src/content/docs/guide/firecracker.md)

**Sections à reprendre :** Prérequis / Lancer avec le jailer.

**Constat.** Les prérequis sont honnêtes mais aucun chemin ne permet à un novice de préparer l’infrastructure. Le jailer introduit root, chroot et cgroups dans le même parcours.

**Action proposée.** Assumer une page pour exploitants déjà équipés, fournir une checklist vérifiable de readiness et isoler la procédure jailer ; conserver les limites de nettoyage.

**Plan examiné :** Prérequis · Configurer le fournisseur · Accès au dépôt · Lancer avec le jailer · Libérer la VM · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 100 lignes EN / 100 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Limiter les accès réseau — P2

[Français](../../src/content/docs/fr/guide/network-restrictions.md) · [English](../../src/content/docs/guide/network-restrictions.md)

**Sections à reprendre :** Autoriser les API / Particularités.

**Constat.** Les conséquences de sécurité sont pertinentes. La syntaxe de validation et les quotas provider occupent l’espace où manque un test concret autorisé/refusé.

**Action proposée.** Ajouter une vérification d’egress dans la sandbox, avec trafic hôte explicitement hors périmètre ; renvoyer quotas/formats à l’API sans retirer les contournements importants.

**Plan examiné :** Choisir une politique · Autoriser les API de modèles et les registres · Particularités de Vercel · Particularités de Daytona · Exécuter un conteneur hors ligne · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 111 lignes EN / 111 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Garder les données Git dans le conteneur — P2

[Français](../../src/content/docs/fr/guide/private-git.md) · [English](../../src/content/docs/guide/private-git.md)

**Sections à reprendre :** Ce qui change / Synchroniser.

**Constat.** « Copie l’historique de la branche » et la ligne sur les refs minimisent les données envoyées : seedHistory crée un bundle --all HEAD, puis ne matérialise que HEAD. Toutes les références ne deviennent pas des branches dans le checkout, mais leur histoire est présente dans le bundle envoyé.

**Action proposée.** Distinguer contenu transmis et refs matérialisées ; aligner la confidentialité de l’envoi avec remote-synchronization. Conserver les règles de montages et de récupération.

**Vérification.** src/application/remote-history.ts:50 et :91 : bundle --all HEAD, puis fetch HEAD.

**Plan examiné :** L’activer · Ce qui change par rapport au mode monté · Synchroniser les modifications avec l’hôte · Monter des dossiers supplémentaires · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 84 lignes EN / 84 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
