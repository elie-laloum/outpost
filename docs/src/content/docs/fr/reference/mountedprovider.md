---
title: "mountedProvider"
description: "mountedProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { mountedProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Enveloppe une définition de provider avec le placement mounted. Le provider expose le workspace hôte par montage et fournit sa propre implémentation d’allocation et de libération.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom          | Type                 | Présence | Rôle                                                                                                            |
| ------------ | -------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Requis   | Nom de provider, variables d’environnement et implémentation acquire à envelopper dans un contrat de placement. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const mountedProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Contrats associés

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
