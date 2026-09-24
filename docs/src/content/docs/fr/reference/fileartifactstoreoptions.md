---
title: "FileArtifactStoreOptions"
description: "FileArtifactStoreOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileArtifactStoreOptions**. Consultez le [guide artefacts typés](../../workflows/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```
