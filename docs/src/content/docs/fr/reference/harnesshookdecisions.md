---
title: "HarnessHookDecisions"
description: "HarnessHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookDecisions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                         | Présence | Rôle                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-start` | `{ readonly instructions: string; }`                         | Requis   | Renvoyez { instructions } pour ajouter du texte aux instructions système du tour.                                                                                                                                                                   |
| `before-model`  | `never`                                                      | Requis   | Aucune décision : toute valeur renvoyée est ignorée ; levez une erreur pour faire échouer le tour.                                                                                                                                                  |
| `after-model`   | `never`                                                      | Requis   | Aucune décision : toute valeur renvoyée est ignorée ; levez une erreur pour faire échouer le tour.                                                                                                                                                  |
| `before-tool`   | `{ readonly deny: string; } \| { readonly input: unknown; }` | Requis   | Renvoyez { deny } avec une raison non vide pour refuser l’appel et ignorer les hooks suivants, ou { input } pour transmettre une entrée de remplacement au hook suivant. L’entrée finale est validée puis contrôlée de nouveau par les permissions. |
| `after-tool`    | `{ readonly result: ToolOutput; }`                           | Requis   | Renvoyez { result } avec du texte ou { content, isError } pour remplacer ce que reçoit le modèle ; les hooks suivants voient le remplacement.                                                                                                       |
| `stop`          | `{ readonly continue: string; }`                             | Requis   | Renvoyez { continue } avec un message non vide pour refuser la réponse finale ; le message devient le message utilisateur suivant et les hooks stop suivants sont ignorés. Borné par maxSteps.                                                      |

## Signature

```ts
export interface HarnessHookDecisions {
  readonly "session-start": {
    readonly instructions: string;
  };
  readonly "before-model": never;
  readonly "after-model": never;
  readonly "before-tool":
    | {
        readonly deny: string;
      }
    | {
        readonly input: unknown;
      };
  readonly "after-tool": {
    readonly result: ToolOutput;
  };
  readonly stop: {
    readonly continue: string;
  };
}
```

## Contrats associés

- [ToolOutput](../tooloutput/)
