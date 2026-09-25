---
title: "remoteSandboxProvider"
description: "remoteSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { remoteSandboxProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Enveloppe une définition de provider avec le placement remote, pour activer l’envoi du dépôt et sa synchronisation par l’application autour du bail fourni par acquire.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom          | Type                 | Présence | Rôle                                                                                                            |
| ------------ | -------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `definition` | `ProviderDefinition` | Requis   | Nom de provider, variables d’environnement et implémentation acquire à envelopper dans un contrat de placement. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare const remoteSandboxProvider: (
  definition: ProviderDefinition,
) => SandboxProvider;
```

## Contrats associés

- [ProviderDefinition](../support-providerdefinition/)
- [SandboxProvider](../sandboxprovider/)
