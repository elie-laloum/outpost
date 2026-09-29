---
title: Transports de stockage — Vue d’ensemble
description: "Stocker des objets versionnés sur disque ou dans S3, et construire dessus les stores de checkpoints, artefacts, cache, journaux et conversations."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Quel store pour quelles données

Chaque store donne un sens et un préfixe de clé à ses objets ; le transport que vous passez décide où vont les octets.

| Données                    | Écrites par                                     | Préfixe de clé   | Limite de taille                                |
| -------------------------- | ----------------------------------------------- | ---------------- | ----------------------------------------------- |
| Checkpoints de workflow    | `createWorkflowCheckpointStore()`               | `checkpoints/`   | 16 Mio par checkpoint                           |
| Artefacts                  | `createArtifactStore()`                         | `artifacts/`     | `maxBytes`, 16 Mio par défaut                   |
| Entrées du cache de tâches | `createTaskCacheStore()`                        | `task-cache/`    | `maxBytes`, 16 Mio par défaut                   |
| Journaux de dispatch       | `logging.transporter`, lus avec `readJournal()` | `logs/`          | `readJournal()` lit 64 Mio et 100000 événements |
| Conversations              | `createTransportConversations()`                | `conversations/` | 1 Gio par capture                               |
| Transferts de récupération | `recoveryTransport` ou `archiveRecovery()`      | `recovery/`      | `maxBytes`, 1 Gio par défaut                    |

Journaux, activité des ressources et réservations de stockage utilisent par défaut un transport local sous `.outpost/storage` du dépôt. Les autres stores exigent un transport que vous créez.

## Local ou S3

Les deux transports stockent au plus 64 Mio par objet, lisent au plus `maxBytes` (64 Mio par défaut) et refusent un `ifRevision` périmé avec `TransportConflict`.

|                         | `createLocalTransport()`                                                          | `createS3Transport()`                                                  |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Import                  | `@elie-laloum/outpost`                                                            | `@elie-laloum/outpost/transports/s3`, avec `@aws-sdk/client-s3`        |
| Emplacement des objets  | Un fichier par clé, réservé au propriétaire, sous `<directory>/objects`           | Un objet par clé sous `prefix`, dans un bucket existant                |
| Écriture conditionnelle | Fichier de verrou par clé, puis contrôle de révision ; attente du verrou 30000 ms | PUT avec `If-Match` ou `If-None-Match: *`                              |
| Suppression             | Supprime le fichier sous le verrou                                                | DELETE conditionnel, ou marqueur masqué avec `deleteMode: "tombstone"` |
| Révision                | Identifiant aléatoire stocké dans l’en-tête de l’objet                            | L’ETag de l’objet                                                      |
| Partagé par             | Les processus d’une même machine                                                  | Toute machine ayant accès au bucket                                    |
| Durée de vie du client  | —                                                                                 | La vôtre : Outpost ne détruit jamais le `S3Client`                     |

:::caution
Utilisez `deleteMode: "tombstone"` sur R2, et le même mode pour tous les écrivains d’un préfixe. Ne purgez les marqueurs qu’après avoir arrêté tous les écrivains.
:::

## Points d’entrée

Guide : [Où vivent les données](../../../guide/storage/) · [S3 et R2](../../../guide/object-storage/) · [Journaux](../../../guide/journals/)

- [createLocalTransport](../../createlocaltransport/)
- [createS3Transport](../../creates3transport/)
- [createWorkflowCheckpointStore](../../createworkflowcheckpointstore/)
- [recoverWorkflowCheckpoint](../../recoverworkflowcheckpoint/)
- [createArtifactStore](../../createartifactstore/)
- [createTaskCacheStore](../../createtaskcachestore/)
- [readJournal](../../readjournal/)
- [createTransportConversations](../../createtransportconversations/)
- [archiveRecovery](../../archiverecovery/)
- [Transport](../../transport/)
- [TransportConflict](../../transportconflict/)
- [S3TransportOptions](../../s3transportoptions/)
