---
title: "Frontières d’exécution et secrets"
description: "Frontières d’exécution et secrets — Outpost"
sidebar:
  order: 3
---

Outpost lance des agents exécutant les commandes du projet. Choisissez dépôts, montages et identifiants adaptés à la tâche.

Docker/Podman exposent la copie sélectionnée, les métadonnées Git nécessaires et les volumes explicites. Les containers utilisent UID/GID choisi, capacités réduites, no-new-privileges et home privé. Périphériques supplémentaires, montages inscriptibles et hooks élevés élargissent volontairement cette frontière.

Les métadonnées Git partagées restent inscriptibles. Une sandbox montée ne protège pas le dépôt hôte ou sa configuration contre un agent hostile. Outpost désactive les hooks pour ses propres commandes Git, mais les outils du dépôt peuvent exécuter d’autres programmes. `localSandboxProvider()` n’isole pas les fichiers.

Les providers distants envoient historique et fichiers sélectionnés à votre compte cloud. Consultez leurs politiques réseau et de stockage. Les identifiants envoyés sont accessibles au code exécuté dans l’environnement.

Les identifiants d’agent ne sont préparés que si un harness choisit `authentication`. Outpost lit les fichiers de compte sur l’hôte (fichiers ordinaires d’au plus 1 Mio ; liens et dossiers refusés) et ne lit jamais de trousseau système. Dans une sandbox isolée, un seul installateur reçoit les fichiers sur stdin et les écrit dans le home privé avec des dossiers `0700` et des fichiers `0600`, en refusant toute traversée de chemin ; les secrets n’apparaissent jamais dans les arguments de commande. Les variables d’identifiants atteignent chaque commande de cet agent dans la sandbox : le code lancé par l’agent peut donc les lire. Une connexion de compte copiée porte votre session d’abonnement : préférez un profil dédié ou un jeton de longue durée lorsque le renouvellement des jetons de rafraîchissement compte. Le provider local n’écrit aucun fichier d’identifiants et ne lance aucune commande de connexion. Voir [l’authentification](../../manual/authentication/).

## Protéger les artefacts sensibles

- Garder les secrets dans des fichiers ignorés ou une configuration de processus sûre, jamais dans les sources ou URL Git.
- Préférer l’option `authentication` du harness au montage de fichiers d’authentification ; monter seulement les fichiers requis, en lecture seule lorsque possible.
- Traiter logs, transcripts, bundles et patches comme potentiellement sensibles.
- Gérer séparément la conservation de `.outpost/logs`, `.outpost/recovery` et du stockage natif des agents.

Une substitution de prompt ne crée pas de nouveau fragment d’expansion, mais une valeur dans une commande shell existante conserve sa sémantique shell. Utilisez des valeurs fiables et correctement citées.

`close()` explicite ou `await using` assure le nettoyage normal. SIGINT/SIGTERM attendent le nettoyage enregistré ; une sortie forcée ne garantit pas la fermeture cloud asynchrone. Vérifiez les ressources cloud après un arrêt brutal.

Signalez les défauts reproductibles en privé via le canal de sécurité du dépôt s’il est actif, ou le profil de l’auteur. Ne joignez aucun identifiant réel. `SECURITY.md` à la racine reste la politique du dépôt.
