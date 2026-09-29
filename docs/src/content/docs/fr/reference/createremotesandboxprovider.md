---
title: "createRemoteSandboxProvider"
description: "createRemoteSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un SandboxProvider au placement remote à partir d’un nom, de variables et d’acquire(). Outpost envoie l’historique du dépôt dans la racine du bail, installe un CLI d’agent manquant et resynchronise les changements sans écraser les modifications hôtes concurrentes. Un nom vide échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/custom-sandbox-providers/).

## Paramètres et propriétés

| Nom          | Type                 | Présence | Rôle                                                                                                 |
| ------------ | -------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Requis   | Nom, variables optionnelles et acquire() de votre provider ; la fabrique ajoute le placement remote. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const createRemoteSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Contrats associés

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
