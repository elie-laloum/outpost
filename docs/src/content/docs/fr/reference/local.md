---
title: "local"
description: "local — Outpost API"
sidebar:
  order: 10
---

Contrat public de **local**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { local } from "@elie-laloum/outpost/providers/local";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                          |
| ------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                       |

## Retour

`SandboxProvider`

## Signature

```ts
export declare function local(options?: LocalOptions): SandboxProvider;
```

## Contrats associés

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
