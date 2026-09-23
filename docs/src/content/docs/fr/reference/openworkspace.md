---
title: "openWorkspace"
description: "openWorkspace — Outpost API"
sidebar:
  order: 10
---

Contrat public de **openWorkspace**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { openWorkspace } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function openWorkspace(
  options?: WorkspaceOptions,
): Promise<Workspace>;
```

## Contrats associés

- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
