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

| Nom                | Type                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerRecovery` | `((resourceId: string) => Promise<void>) \| undefined` | Optionnel | Enregistre un identifiant de ressource stable, d’au plus 1024 caractères, pour que recover() puisse supprimer la ressource après un crash. Outpost ne le fournit que pendant une spéculation durable : attendez-le une fois avant d’allouer, et n’allouez pas s’il rejette. |
| `repository`       | `string`                                               | Requis    | Chemin hôte du dépôt Git ciblé.                                                                                                                                                                                                                                             |
| `directory`        | `string`                                               | Requis    | Chemin hôte du worktree de cette sandbox ; un provider mounted l’expose à la racine du bail.                                                                                                                                                                                |
| `gitDirectories`   | `readonly string[]`                                    | Requis    | Répertoires Git hôtes nécessaires au worktree, le sien en premier et le répertoire commun en dernier. Un provider mounted les expose pour que git fonctionne dans la sandbox.                                                                                               |
| `variables`        | `Readonly<Record<string, string>>`                     | Requis    | Environnement de chaque commande : valeurs résolues de .outpost/.env, variables du provider et identité Git d’auteur et de committer. Les variables de l’agent s’ajoutent à chaque commande.                                                                                |
| `signal`           | `AbortSignal \| undefined`                             | Optionnel | Annule l’acquisition ; libérez ce qui est déjà alloué avant de rejeter.                                                                                                                                                                                                     |

## Signature

```ts
export interface SandboxContext {
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [Variables](../variables/)
