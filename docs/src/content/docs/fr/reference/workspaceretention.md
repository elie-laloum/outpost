---
title: "WorkspaceRetention"
description: "WorkspaceRetention — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceRetention } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom           | Type                             | Présence          | Rôle                                                                                                                      |
| ------------- | -------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `policy`      | `"run" \| "local" \| "portable"` | Requis            | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites. |
| `transporter` | `Transport`                      | Selon la variante | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.          |

## Signature

```ts
export type WorkspaceRetention =
  | {
      readonly policy: "run" | "local";
    }
  | {
      readonly policy: "portable";
      readonly transporter: Transport;
    };
```

## Contrats associés

- [Transport](../transport/)
