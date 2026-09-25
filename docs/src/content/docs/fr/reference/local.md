---
title: "local"
description: "local — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { local } from "@elie-laloum/outpost/providers/local";
```

## Rôle et comportement

Crée un provider explicitement sans isolation qui exécute les commandes sur l’hôte dans le workspace choisi. Aucun conteneur ni VM n’est alloué ; l’accès aux fichiers et aux identifiants reste celui du processus appelant.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                       |
| ------------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optionnel | Variables d’environnement explicites pour l’exécution hôte sans isolation. |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.    |

## Retour

`SandboxProvider`

## Signature

```ts
export declare function local(options?: LocalOptions): SandboxProvider;
```

## Contrats associés

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
