---
title: "workspaceFingerprint"
description: "workspaceFingerprint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workspaceFingerprint } from "@elie-laloum/outpost";
```

## Rôle et comportement

Calcule une empreinte canonique de manifest de fichiers sans Git, conservant chemins, contenus, types, modes, liens et identité de sélection.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom         | Type                             | Présence  | Rôle                                                                                                     |
| ----------- | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `workspace` | `string \| FileWorkspace`        | Requis    | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.           |
| `paths`     | `readonly string[] \| undefined` | Optionnel | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore. |

## Retour

`Promise<string>`

## Signature

```ts
export declare function workspaceFingerprint(
  workspace: FileWorkspace | string,
  paths?: readonly string[],
): Promise<string>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
