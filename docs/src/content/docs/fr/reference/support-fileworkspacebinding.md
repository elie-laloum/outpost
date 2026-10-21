---
title: "FileWorkspaceBinding"
description: "FileWorkspaceBinding — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Manière dont un workspace de fichiers atteint sa sandbox : copy transfère les fichiers, ephemeral démarre vide, mount-readonly et mount-write exposent le répertoire source. Les fournisseurs listent les modes pris en charge dans workspaces.bindings, et les plans de recettes indiquent celui qu’un workspace exige.

## Signature

```ts
export type FileWorkspaceBinding =
  "copy" | "ephemeral" | "mount-readonly" | "mount-write";
```
