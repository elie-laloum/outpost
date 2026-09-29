---
title: "createLocalSandboxProvider"
description: "createLocalSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
```

## Rôle et comportement

Crée un provider sans isolation qui exécute les commandes comme processus hôtes dans le worktree, avec votre home, votre environnement, vos fichiers et vos identifiants. Aucun conteneur ni VM n’est alloué. Une option egress échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/host-process/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                                 |
| ------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optionnel | Variables d’environnement explicites pour l’exécution hôte sans isolation.                                                                           |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement ajoutées aux commandes hôtes, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration. |

## Retour

`SandboxProvider`

## Signature

```ts
export declare function createLocalSandboxProvider(
  options?: LocalOptions,
): SandboxProvider;
```

## Contrats associés

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
