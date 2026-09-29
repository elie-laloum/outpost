---
title: "StorageEntryKind"
description: "StorageEntryKind — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Type d’une StorageEntry dans un inventaire de stockage. Valeurs : "file", "directory", "symlink" (compté, non suivi), "other" (fichier spécial comme un socket ou une FIFO ; l’entrée est incomplète), "unknown" (non mesuré, car la limite d’entrées est atteinte ou l’entrée est illisible). Les entrées de transport sont toujours "file".

## Signature

```ts
export type StorageEntryKind =
  "file" | "directory" | "symlink" | "other" | "unknown";
```
