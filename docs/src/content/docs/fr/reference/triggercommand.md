---
title: "TriggerCommand"
description: "TriggerCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerCommand } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                     | Présence  | Rôle                                                                                         |
| ------------ | ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `source`     | `"github" \| "gitlab" \| "slack"`        | Requis    | Émetteur de la commande : github, gitlab ou slack.                                           |
| `text`       | `string`                                 | Requis    | Texte après la commande, sans espaces de bord ; vide lorsque la commande n’a pas d’argument. |
| `repository` | `string \| undefined`                    | Optionnel | Dépôt de l’issue ou de la demande commentée, pour les commentaires GitHub et GitLab.         |
| `number`     | `number \| undefined`                    | Optionnel | Numéro ou IID de l’issue ou de la demande commentée, lorsque la charge le fournit.           |
| `target`     | `"issue" \| "pull-request" \| undefined` | Optionnel | issue ou pull-request, présent avec number.                                                  |

## Signature

```ts
export interface TriggerCommand {
  readonly source: "github" | "gitlab" | "slack";
  /** Text following the command, trimmed. */
  readonly text: string;
  readonly repository?: string;
  readonly number?: number;
  readonly target?: "issue" | "pull-request";
}
```
