---
title: "inspectWorkspacePathLocks"
description: "inspectWorkspacePathLocks — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectWorkspacePathLocks } from "@elie-laloum/outpost";
```

## Rôle et comportement

Liste les verrous d’hôte/utilisateur coordonnant matérialisations, montages et destinations de publication qui se chevauchent entre répertoires de runtime.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Retour

`Promise<readonly WorkspacePathLock[]>`

## Signature

```ts
export declare function inspectWorkspacePathLocks(): Promise<
  readonly WorkspacePathLock[]
>;
```

## Contrats associés

- [WorkspacePathLock](../workspacepathlock/)
