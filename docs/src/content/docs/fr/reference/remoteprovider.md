---
title: "remoteProvider"
description: "remoteProvider — Outpost API"
sidebar:
  order: 10
---

Contrat public de **remoteProvider**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { remoteProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom          | Type                 | Présence | Rôle                                                                             |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const remoteProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Contrats associés

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
