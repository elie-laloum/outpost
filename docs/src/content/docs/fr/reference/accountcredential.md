---
title: "AccountCredential"
description: "AccountCredential — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AccountCredential } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom        | Type     | Présence          | Rôle                                                                                                                                                                                                                                                                  |
| ---------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`     | `string` | Selon la variante | Chemin hôte d’un fichier de session, ou d’un dossier de profil Kimi Code, lu à la place de l’emplacement par défaut de la CLI. ~ désigne le home de l’hôte ; les chemins relatifs partent du dossier courant. Seuls des fichiers ordinaires d’au plus 1 Mio sont lus. |
| `key`      | `string` | Selon la variante | Jeton d’abonnement littéral transmis dans la variable de jeton de la CLI (Claude CLAUDE_CODE_OAUTH_TOKEN, Copilot COPILOT_GITHUB_TOKEN). Préférez variable pour garder les secrets hors du code.                                                                      |
| `variable` | `string` | Selon la variante | Nom d’une variable résolue du workflow contenant le jeton d’abonnement ; sa valeur est transmise dans la variable de jeton de la CLI.                                                                                                                                 |

## Signature

```ts
export type AccountCredential =
  | {
      readonly file: string;
    }
  | {
      readonly key: string;
    }
  | {
      readonly variable: string;
    };
```
