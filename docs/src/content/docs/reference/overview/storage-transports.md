---
title: Storage transports — Overview
description: "Store versioned objects on disk or in S3, and build checkpoint, artifact, cache, journal and conversation stores on them."
sidebar:
  label: Overview
  order: 0
---

## Which store for which data

Each store gives its objects a meaning and a key prefix; the transport you pass decides where the bytes land.

| Data                 | Written through                                  | Key prefix       | Size bound                                  |
| -------------------- | ------------------------------------------------ | ---------------- | ------------------------------------------- |
| Workflow checkpoints | `createWorkflowCheckpointStore()`                | `checkpoints/`   | 16 MiB per checkpoint                       |
| Artifacts            | `createArtifactStore()`                          | `artifacts/`     | `maxBytes`, 16 MiB by default               |
| Task cache entries   | `createTaskCacheStore()`                         | `task-cache/`    | `maxBytes`, 16 MiB by default               |
| Dispatch journals    | `logging.transporter`, read with `readJournal()` | `logs/`          | `readJournal()` reads 64 MiB, 100000 events |
| Conversations        | `createTransportConversations()`                 | `conversations/` | 1 GiB per capture                           |
| Recovery transfers   | `recoveryTransport` or `archiveRecovery()`       | `recovery/`      | `maxBytes`, 1 GiB by default                |

Journals, resource activity and storage reservations default to a local transport under the repository’s `.outpost/storage`. The other stores need a transport you create.

## Local or S3

Both transports store at most 64 MiB per object, read at most `maxBytes` (64 MiB by default), and reject a stale `ifRevision` with `TransportConflict`.

|                    | `createLocalTransport()`                                   | `createS3Transport()`                                                 |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Import             | `@elie-laloum/outpost`                                     | `@elie-laloum/outpost/transports/s3`, with `@aws-sdk/client-s3`       |
| Where objects live | One owner-only file per key under `<directory>/objects`    | One object per key under `prefix` in an existing bucket               |
| Conditional write  | Per-key lock file, then revision check; 30000 ms lock wait | PUT with `If-Match` or `If-None-Match: *`                             |
| Removal            | Deletes the file under the lock                            | Conditional DELETE, or a hidden marker with `deleteMode: "tombstone"` |
| Revision           | Random ID stored in the object header                      | The object’s ETag                                                     |
| Shared by          | Processes on one machine                                   | Every machine with access to the bucket                               |
| Client lifetime    | —                                                          | Yours: Outpost never destroys the `S3Client`                          |

:::caution
Use `deleteMode: "tombstone"` on R2, and the same mode for every writer of a prefix. Purge markers only after stopping every writer.
:::

## Entry points

Guide: [Where data lives](../../../guide/storage/) · [S3 and R2](../../../guide/object-storage/) · [Journals](../../../guide/journals/)

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
