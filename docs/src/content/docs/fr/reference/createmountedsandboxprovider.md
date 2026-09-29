---
title: "createMountedSandboxProvider"
description: "createMountedSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createMountedSandboxProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un SandboxProvider au placement mounted à partir d’un nom, de variables et d’acquire(). Votre acquire() expose context.directory et context.gitDirectories dans l’environnement : l’agent modifie directement le worktree hôte. Un nom vide échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/custom-sandbox-providers/).

## Paramètres et propriétés

| Nom          | Type                 | Présence | Rôle                                                                                                  |
| ------------ | -------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Requis   | Nom, variables optionnelles et acquire() de votre provider ; la fabrique ajoute le placement mounted. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const createMountedSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Contrats associés

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
