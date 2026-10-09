---
title: "WorkspaceInput"
description: "WorkspaceInput — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom           | Type                             | Présence          | Rôle                                                                                                              |
| ------------- | -------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`                         | Selon la variante | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.              |
| `paths`       | `readonly string[] \| undefined` | Selon la variante | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.          |
| `snapshot`    | `TransportReference`             | Selon la variante | Référence Transport d’un snapshot de fichiers vérifié ; sa restauration n’atteste pas la fermeture d’une sandbox. |
| `transporter` | `Transport`                      | Selon la variante | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.  |

## Signature

```ts
export type WorkspaceInput =
  | {
      readonly directory: string;
      readonly paths?: readonly string[];
    }
  | {
      readonly snapshot: TransportReference;
      readonly transporter: Transport;
    };
```

## Contrats associés

- [Transport](../transport/)
- [TransportReference](../transportreference/)
