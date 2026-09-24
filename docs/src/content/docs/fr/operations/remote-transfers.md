---
title: Transferts de fichiers distants
description: Manifestes incrémentaux, lots compressés et reprise de synchronisation.
sidebar:
  order: 5
---

Vercel et Daytona synchronisent les fichiers non suivis avec des manifestes SHA-256 et des lots compressés. Leurs fournisseurs intégrés activent ce comportement automatiquement. Les fournisseurs personnalisés peuvent l'activer via `SandboxLease.fileTransfers` ; sans cette capacité facultative, chaque fichier est téléchargé séparément.

## Contenu transféré

La première synchronisation télécharge tous les fichiers non suivis sélectionnés par Git. Chaque synchronisation réussie mémorise son manifeste pendant la durée de vie du sandbox. Les suivantes comparent le chemin, le type, les permissions, la taille et SHA-256. Un fichier inchangé est réutilisé depuis l'hôte uniquement après vérification de ses octets et de toutes ses métadonnées par rapport au dernier manifeste appliqué. Les fichiers modifiés sont téléchargés ; les entrées disparues sont supprimées dans la transaction de synchronisation existante. Aucun cache persistant de contenu n'est à invalider ou à purger.

La sélection repose sur `ls-files --others --exclude-standard`, y compris les fichiers imbriqués et les liens symboliques. Les dossiers vides et les fichiers ignorés ne sont pas des entrées de synchronisation. Cette optimisation ne modifie pas les règles de sélection Git. Les `copies` explicites téléversent toujours leurs entrées indépendamment. Un chemin entrant non suivi qui recouvre un fichier hôte ignoré ou protégé provoque un conflit ; il n'est ni omis ni écrasé silencieusement.

Les changements suivis utilisent toujours des patchs Git binaires et les nouveaux commits des bundles Git autonomes. L'initialisation du dépôt, les copies demandées et le téléversement initial des changements non commités conservent leurs chemins de transfert existants. Ces opérations n'utilisent pas les lots incrémentaux compressés. Une synchronisation sans changement télécharge encore son patch Git et réalise la validation Git et la sauvegarde hôte.

## Compression et limites

Les fichiers non suivis modifiés sont regroupés en lots gzip contenant au plus **8 Mio de données** et **128 entrées**. Des chemins longs peuvent réduire les lots afin de borner la taille des arguments de commande. Les données binaires sont encodées en base64 dans l'enveloppe compressée, séparément des métadonnées. Elles ne transitent pas par une conversion textuelle de stdout. Un fichier dépassant 8 Mio utilise le téléchargement ordinaire du fournisseur, puis est vérifié contre son manifeste.

Les permissions et les cibles littérales des liens symboliques sont conservées lorsque l'hôte les prend en charge. Les liens ne sont jamais suivis pour le calcul du condensat ou la copie. Le remplacement d'un fichier, dossier ou lien est pris en charge ; seuls les anciens dossiers vides sont supprimés. Les dossiers contenant des données hôte ignorées restent protégés.

Les lots bornent la mémoire de sérialisation et le nombre de requêtes réseau, sans garantir un gain pour les fichiers déjà compressés. Les manifestes imposent de lire et de hacher les fichiers distants à chaque synchronisation ; la réutilisation relit aussi les octets hôte. Ce compromis réduit les téléchargements au prix d'entrées-sorties locales et distantes. Les valeurs sont fixes ; aucun réglage public du niveau de compression ou de la taille des lots n'est disponible. `limits.copyMs` borne les opérations de manifeste et de transfert par lots. La synchronisation après l'interruption d'un agent reste une étape de récupération indépendante.

## Échec et récupération

Chaque fichier entrant, même réutilisé, est matérialisé dans la tentative de récupération courante avant l'application à l'hôte. SHA-256 détecte les fichiers distants modifiés et les contenus endommagés. L'empreinte hôte continue de détecter les modifications concurrentes. Les chemins traversant un lien parent, les métadonnées Git et les chemins internes Outpost sont refusés.

L'ordre de la transaction reste : télécharger, valider, sauvegarder l'hôte, enregistrer les sommes de contrôle, appliquer. L'échec d'un lot laisse l'hôte intact et conserve la partie téléchargée et `manifest.json` dans le répertoire de récupération de la tentative. Un téléchargement incomplet ne possède pas encore d'état intégralement restaurable. Un échec après sauvegarde conserve les arborescences entrantes et précédentes complètes, avec le format de sommes de contrôle existant, même pour les fichiers réutilisés. Les tentatives échouées restent disponibles après une nouvelle tentative réussie. Les archives de transport temporaires sont nettoyées ; le nettoyage distant dépend de la disponibilité du fournisseur.

Le manifeste n'avance qu'après une application réussie. Les fichiers supprimés ne peuvent pas réapparaître depuis un manifeste obsolète. Voir [Récupération](../recovery/) pour inspecter et vérifier les tentatives conservées.

## Contrat des fournisseurs personnalisés

`FileTransfers.manifest(source, paths, options)` renvoie un `FileManifestEntry` par chemin relatif demandé, dans le même ordre. Chaque entrée décrit un fichier ou un lien avec `path`, `kind`, `mode`, `size` et `sha256` en hexadécimal minuscule. Pour un lien, la taille et le condensat décrivent sa cible en UTF-8. Le contenu des dossiers est représenté par les chemins de leurs fichiers.

`FileTransfers.downloadBatch(source, entries, destination, options)` doit matérialiser les entrées sous la destination, préserver leurs métadonnées, vérifier les condensats fournis et refuser les chemins dangereux. La destination est nouvelle pour chaque tentative. L'implémentation doit respecter annulation et délais et refuser les changements de source pendant le transfert. Cette capacité est facultative et ne doit jamais basculer silencieusement vers l'hôte. L'implémentation cloud intégrée nécessite Node.js dans l'environnement distant, comme les transferts de fichiers existants de ces fournisseurs.
