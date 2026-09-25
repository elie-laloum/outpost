---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                               | Présence  | Rôle                                                                           |
| ---------------- | ---------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `repository`     | `string`                           | Requis    | Checkout Git hôte ciblé.                                                       |
| `directory`      | `string`                           | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                        |
| `gitDirectories` | `readonly string[]`                | Requis    | Dossiers hôtes de métadonnées Git nécessaires à l’accès au dépôt du workspace. |
| `variables`      | `Readonly<Record<string, string>>` | Requis    | Déclarations d’environnement explicites ; les valeurs sont des chaînes.        |
| `signal`         | `AbortSignal \| undefined`         | Optionnel | Annulation coopérative de cette opération.                                     |

## Signature

```ts
export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [Variables](../variables/)
