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

Les changements suivis utilisent des patchs Git binaires. Les [transferts d’historique Git](../../../environment/remote-sync/) utilisent des bundles différentiels vérifiés lorsqu’une base adaptée existe ; la récupération conserve des bundles complets autonomes. Un dépôt neuf nécessite toujours l’historique complet. Une synchronisation sans changement télécharge encore son patch Git et réalise la validation Git et la sauvegarde hôte.

## Téléversements initiaux et copies

Les fournisseurs cloud intégrés regroupent aussi les entrées non suivies initiales lorsque `includeUncommitted` est activé, et les `copies` explicites désignant des fichiers individuels ou des liens symboliques. Avant d'envoyer un contenu, Outpost hache la source et la destination actuelle, puis compare type, permissions, taille et SHA-256. Une entrée distante vérifiée et identique ne nécessite aucun téléversement. Un sandbox neuf a toujours besoin de tous les octets sélectionnés ; l'optimisation réduit les envois seulement si la destination contient déjà des fichiers identiques, notamment avec un fournisseur personnalisé qui réutilise ou prépare son espace de travail. Aucun cache persistant de téléversement n'est utilisé.

Les lots de téléversement ont les mêmes limites de 8 Mio et 128 entrées. Au-delà de 8 Mio, un fichier utilise une copie locale vérifiée et le téléversement binaire ordinaire du fournisseur, avant vérification distante du condensat ; cet envoi individuel conserve les caractéristiques mémoire du fournisseur. Les contenus temporaires sont préparés dans des répertoires privés, vérifiés avant installation et nettoyés après succès, échec ou annulation. Une modification de source détectée pendant le transfert fait échouer l'opération. Les fichiers déjà installés peuvent rester après un échec ; le téléversement de plusieurs fichiers n'est pas une transaction atomique. Les dossiers de destination et les parents symboliques sont refusés au lieu d'être traversés ou remplacés récursivement.

Les dossiers désignés dans `copies` conservent le téléversement récursif existant du fournisseur, y compris les dossiers vides et leurs permissions ; ces copies ne sont pas incrémentales. Les lots de fichiers préservent les permissions et les cibles littérales des liens symboliques. Ils ne suppriment pas les fichiers distants sans rapport. Les bundles Git initiaux, les patchs suivis et les artefacts de récupération restent indépendants de ces lots. Les leases personnalisés sans `uploadBatch` conservent les téléversements ordinaires.

## Compression et limites

Les fichiers non suivis modifiés sont regroupés en lots gzip contenant au plus **8 Mio de données** et **128 entrées**. Des chemins longs peuvent réduire les lots afin de borner la taille des arguments de commande. Les données binaires sont encodées en base64 dans l'enveloppe compressée, séparément des métadonnées. Elles ne transitent pas par une conversion textuelle de stdout. Un fichier dépassant 8 Mio utilise le téléchargement ordinaire du fournisseur, puis est vérifié contre son manifeste.

Les permissions et les cibles littérales des liens symboliques sont conservées lorsque l'hôte les prend en charge. Les liens ne sont jamais suivis pour le calcul du condensat ou la copie. Le remplacement d'un fichier, dossier ou lien est pris en charge ; seuls les anciens dossiers vides sont supprimés. Les dossiers contenant des données hôte ignorées restent protégés.

Les lots bornent la mémoire de sérialisation et le nombre de requêtes réseau, sans garantir un gain pour les fichiers déjà compressés. Les manifestes imposent de lire et de hacher les fichiers distants à chaque synchronisation ; la réutilisation relit aussi les octets hôte. Ce compromis réduit les téléchargements au prix d'entrées-sorties locales et distantes. Les valeurs sont fixes ; aucun réglage public du niveau de compression ou de la taille des lots n'est disponible. `limits.copyMs` borne les opérations de manifeste et de transfert par lots. La synchronisation après l'interruption d'un agent reste une étape de récupération indépendante.

## Échec et récupération

Chaque fichier entrant, même réutilisé, est matérialisé dans la tentative de récupération courante avant l'application à l'hôte. SHA-256 détecte les fichiers distants modifiés et les contenus endommagés. L'empreinte hôte continue de détecter les modifications concurrentes. Les chemins traversant un lien parent, les métadonnées Git et les chemins internes Outpost sont refusés.

L'ordre de la transaction reste : télécharger, valider, sauvegarder l'hôte, enregistrer les sommes de contrôle, appliquer. L'échec d'un lot laisse l'hôte intact et conserve la partie téléchargée et `manifest.json` dans le répertoire de récupération de la tentative. Un téléchargement incomplet ne possède pas encore d'état intégralement restaurable. Un échec après sauvegarde conserve les arborescences entrantes et précédentes complètes, avec le format de sommes de contrôle existant, même pour les fichiers réutilisés. Les tentatives échouées restent disponibles après une nouvelle tentative réussie. Les archives de transport temporaires sont nettoyées ; le nettoyage distant dépend de la disponibilité du fournisseur.

Le manifeste n'avance qu'après une application réussie. Les fichiers supprimés ne peuvent pas réapparaître depuis un manifeste obsolète. Voir [Récupération](../../../operations/recovery/) pour inspecter et vérifier les tentatives conservées.

## Contrat des fournisseurs personnalisés

`FileTransfers.manifest(source, paths, options)` renvoie un `FileManifestEntry` par chemin relatif demandé, dans le même ordre. Chaque entrée décrit un fichier ou un lien avec `path`, `kind`, `mode`, `size` et `sha256` en hexadécimal minuscule. Pour un lien, la taille et le condensat décrivent sa cible en UTF-8. Le contenu des dossiers est représenté par les chemins de leurs fichiers.

`FileTransfers.downloadBatch(source, entries, destination, options)` doit matérialiser les entrées sous la destination, préserver leurs métadonnées, vérifier les condensats fournis et refuser les chemins dangereux. La destination est nouvelle pour chaque tentative. L'implémentation doit respecter annulation et délais et refuser les changements de source pendant le transfert. Cette capacité est facultative et ne doit jamais basculer silencieusement vers l'hôte. L'implémentation cloud intégrée nécessite Node.js dans l'environnement distant, comme les transferts de fichiers existants de ces fournisseurs.

`FileTransfers.uploadBatch(source, entries, destination, options)` est une méthode supplémentaire facultative. Sa source est un dossier hôte et sa destination un dossier du sandbox. Elle doit vérifier le manifeste source fourni, omettre un contenu uniquement après vérification de la destination actuelle, conserver les métadonnées, refuser les chemins dangereux, respecter annulation et délais et rejeter les mutations de source ou les contenus endommagés. Les implémentations existantes avec seulement `manifest` et `downloadBatch` restent valides.
