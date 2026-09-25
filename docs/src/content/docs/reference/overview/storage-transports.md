---
title: Storage transports — Overview
description: Persist workflow data through local or S3 object storage.
sidebar:
  label: Overview
  order: 0
---

A transport stores versioned binary objects under logical keys. Stores retain their artifact, checkpoint, journal and conversation rules while the transport supplies bounded reads and conditional mutations.

## How it works

Use `localTransport` for a private directory or `s3Transport` from the optional `transports/s3` entry point with a caller-owned S3 client. Compose stores over the transport and persist their references independently of sandbox lifetimes. Inspection observes object metadata; retention revalidates closed journals before deletion.

## Boundaries and responsibilities

Checkpoints retain explicit ownership until release or authorized recovery. Archives and native conversations materialize files when Git or an agent needs them. Workspaces, SQLite and sandbox mounts still require filesystems. Remote activity is an observation with unverified ownership, not proof that another machine has stopped. Existing directory stores retain their original format and are not migrated automatically.

## Entry points

- [localTransport](../../localtransport/)
- [s3Transport](../../s3transport/)
- [artifactStore](../../function-artifactstore/)
- [workflowCheckpointStore](../../function-workflowcheckpointstore/)
- [Transport](../../transport/)
- [inspectRecovery](../../inspectrecovery/)

[Read the practical guide](../../../guide/operations/storage-transports/).
