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
| `key`      | `string` | Selon la variante | Jeton d’abonnement littéral transmis comme CLAUDE_CODE_OAUTH_TOKEN (Claude Code) ou COPILOT_GITHUB_TOKEN (Copilot) ; les autres CLI le refusent. Préférez variable pour garder les secrets hors des fichiers sources.                                                 |
| `variable` | `string` | Selon la variante | Nom d’une variable de workflow résolue contenant le jeton d’abonnement, transmis comme key ; Claude Code et Copilot uniquement.                                                                                                                                       |

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
