---
title: Transports de stockage — Vue d’ensemble
description: Conserver les données des workflows dans un stockage objet local ou S3.
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un transport conserve des objets binaires versionnés sous des clés logiques. Les stores gardent leurs règles d’artefacts, checkpoints, journaux et conversations ; le transport fournit les lectures bornées et les mutations conditionnelles.

## Fonctionnement

Utilisez `localTransport` pour un dossier privé ou `s3Transport`, depuis le point d’entrée optionnel `transports/s3`, avec un client S3 appartenant à l’appelant. Composez les stores sur le transport et conservez leurs références indépendamment des sandboxes. L’inspection observe les métadonnées ; la rétention revalide les journaux fermés avant suppression.

## Limites et responsabilités

Les checkpoints gardent une propriété explicite jusqu’à libération ou récupération autorisée. Archives et conversations natives matérialisent les fichiers nécessaires à Git ou à l’agent. Workspaces, SQLite et montages exigent toujours un système de fichiers. L’activité distante reste une observation dont la propriété n’est pas vérifiée ; elle ne prouve pas l’arrêt d’une autre machine. Les stores par dossier gardent leur format et ne sont pas migrés automatiquement.

## Points d’entrée

- [localTransport](../../localtransport/)
- [s3Transport](../../s3transport/)
- [artifactStore](../../function-artifactstore/)
- [workflowCheckpointStore](../../function-workflowcheckpointstore/)
- [Transport](../../transport/)
- [inspectRecovery](../../inspectrecovery/)

[Lire le guide pratique](../../../guide/operations/storage-transports/).
