---
title: "FileManifestEntry"
description: "FileManifestEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileManifestEntry**. Consultez le [guide transferts distants](../../operations/remote-transfers/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileManifestEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface FileManifestEntry {
  readonly path: string;
  readonly kind: "file" | "link";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
}
```
