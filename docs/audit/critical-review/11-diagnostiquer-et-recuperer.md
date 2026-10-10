# Lot 11 — Diagnostiquer et récupérer

Les conséquences d’échec sont préservées. Les chemins usuels se perdent dans les variantes TypeScript et l’inventaire des contrats ; la référence CLI fichiers est incomplète.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Diagnostiquer un problème — P2

[Français](../../src/content/docs/fr/guide/diagnostics.md) · [English](../../src/content/docs/guide/diagnostics.md)

**Sections à reprendre :** Ce que vérifie doctor / Adaptateur hors ligne.

**Constat.** Trois audiences : utilisateur bloqué, sonde de sandbox ouverte et développeur d’adaptateur. Deux tableaux de contrats avant les symptômes et remèdes.

**Action proposée.** Garder doctor et un chemin symptôme → vérification → suite ; déplacer diagnoseAgentProtocol vers custom-agents, et les détails de sondes dans l’API.

**Plan examiné :** Vérifier les prérequis · Ce que vérifie doctor · Lire le rapport JSON · Diagnostiquer une sandbox ouverte · Vérifier un adaptateur d’agent hors ligne · Tester l’accès au modèle · Comprendre un délai de connexion dépassé · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 138 lignes EN / 138 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Gérer les erreurs — P2

[Français](../../src/content/docs/fr/guide/error-handling.md) · [English](../../src/content/docs/guide/error-handling.md)

**Sections à reprendre :** Codes d’erreur / Journaliser sans fuite.

**Constat.** Bonne distinction promesse rejetée/résultat, mais un H2 vide de conseils renvoie uniquement à FaultCode. Le code du workflow affiche first.details, alors que la fin déconseille details à cause des secrets.

**Action proposée.** Choisir des champs sûrs dans les exemples aussi ; fournir trois catégories d’action plutôt qu’un H2 sans réponse, renvoyer la liste exhaustive à l’API.

**Sections sans réponse pratique :** « Codes d’erreur ». Elles ne contiennent actuellement qu’un lien API.

**Plan examiné :** Comprendre les retours d’erreur · Examiner une OutpostError · Codes d’erreur · Reconnaître les quotas et les pannes · Traiter un workflow en échec · Relancer à bon escient · Journaliser sans fuite · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 155 lignes EN / 155 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Récupérer du travail — P2

[Français](../../src/content/docs/fr/guide/recovery.md) · [English](../../src/content/docs/guide/recovery.md)

**Sections à reprendre :** Restaurer / Récupérer depuis le code / Archiver.

**Constat.** Parcours CLI prudent et utile ; il est suivi de son équivalent TypeScript et d’un troisième parcours d’archive. « Deux échecs indiquent… » n’est plus suivi de leur liste, déplacée vers l’API.

**Action proposée.** Garder inspecter/vérifier/restaurer/relire ; isoler archivage et automatisation TypeScript ; réparer les transitions devenues vides après extraction.

**Plan examiné :** Ce qu’Outpost conserve · Lire l’erreur · Restaurer un transfert distant · Récupérer depuis le code · Archiver un transfert à distance · Libérer une exécution ou une course arrêtée · Nettoyer ensuite · Workspaces de fichiers · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 205 lignes EN / 205 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Commandes de récupération — P1

[Français](../../src/content/docs/fr/guide/recovery-cli.md) · [English](../../src/content/docs/guide/recovery-cli.md)

**Sections à reprendre :** inspect / restore / prune.

**Constat.** La référence ne décrit pas --runtime-directory ni les commandes de publication de fichiers, pourtant citées par recovery et publishing-files. Elle reste centrée Git malgré son titre exhaustif.

**Action proposée.** Comparer chaque commande au --help de la CLI locale et compléter les variantes fichiers ; préciser « aucun fichier source modifié » pour verify, qui crée un clone temporaire.

**Vérification.** Aide locale recovery inspect : --runtime-directory ; recovery publication --help : inspect, finish, rollback. Source src/cli/main.constants.ts:309–378.

**Plan examiné :** `outpost recovery inspect` · `outpost recovery verify` · `outpost recovery restore` · `outpost recovery prune`.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 81 lignes EN / 81 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Nettoyer les données enregistrées — P2

[Français](../../src/content/docs/fr/guide/retention.md) · [English](../../src/content/docs/guide/retention.md)

**Sections à reprendre :** Comprendre pourquoi une entrée reste / Réserver du stockage.

**Constat.** La réponse centrale « pourquoi rien n’est supprimé » est réduite à un lien API ; les réservations de stockage sont un autre besoin complexe.

**Action proposée.** Ajouter les raisons fréquentes de conservation avec remède ; séparer réservations et nettoyage. Proposer un aperçu git clean avant sa variante destructive.

**Sections sans réponse pratique :** « Comprendre pourquoi une entrée reste ». Elles ne contiennent actuellement qu’un lien API.

**Plan examiné :** Prévisualiser une politique · L’appliquer · Écrire la politique · Comprendre pourquoi une entrée reste · Nettoyer depuis le code · Nettoyer ce que la rétention conserve · Réserver du stockage entre processus · Limites.

**Repères :** 1 fichiers nommés dans les extraits, variantes comprises ; 121 lignes EN / 121 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Comprendre les limites de sécurité — P2

[Français](../../src/content/docs/fr/guide/security.md) · [English](../../src/content/docs/guide/security.md)

**Sections à reprendre :** Identifiants et données / Limites.

**Constat.** Explication nécessaire, mais « clés restent sur l’hôte, agents ne les reçoivent jamais » oublie le provider local qui hérite de l’environnement et accède aux fichiers hôte. Cette exception est ailleurs dans la page.

**Action proposée.** Formuler les garanties par mode d’exécution, avec exception locale à côté du tableau ; conserver les frontières et réduire uniquement leurs répétitions.

**Plan examiné :** Ce que l’agent peut atteindre · Identifiants et données · Le code qui s’exécute sur votre hôte · Ce qu’Outpost n’authentifie pas · Ce que couvrent les règles réseau · Faire travailler des agents sur du code non fiable · Limites · Pour continuer.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 116 lignes EN / 116 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Commandes en ligne de commande — P2

[Français](../../src/content/docs/fr/guide/cli.md) · [English](../../src/content/docs/guide/cli.md)

**Sections à reprendre :** Choisir une commande / outpost init.

**Constat.** L’introduction ne présente que les scripts TypeScript malgré recipe. Tables doctor/image répétées ailleurs, liens de récupération API collés après init et commentaire « génération facultative de projet » peu utile.

**Action proposée.** Faire un index par tâche puis la référence commune ; garder init détaillé ici, clarifier YAML/TypeScript, retirer les liens API hors sujet en fin de section.

**Plan examiné :** Choisir une commande · Options communes · `outpost doctor` · `outpost image build` · `outpost image remove` · `outpost init` · Pour aller plus loin.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 141 lignes EN / 141 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.
