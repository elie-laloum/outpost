---
title: "FileWorkspaceSource"
description: "FileWorkspaceSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileWorkspaceSource } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                                                                                             | Présence          | Rôle                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `kind`      | `"directory" \| "ephemeral"`                                                                                     | Requis            | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                                |
| `directory` | `string`                                                                                                         | Selon la variante | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                 |
| `access`    | `{ readonly mode: "copy"; } \| { readonly mode: "mount"; readonly target: string; readonly readOnly: boolean; }` | Selon la variante | La copie isole les changements de source ; le montage expose toute la source sous target avec un readOnly explicite. |

## Signature

```ts
export type FileWorkspaceSource =
  | {
      readonly kind: "directory";
      readonly directory: string;
      readonly access:
        | {
            readonly mode: "copy";
          }
        | {
            readonly mode: "mount";
            readonly target: string;
            readonly readOnly: boolean;
          };
    }
  | {
      readonly kind: "ephemeral";
    };
```
