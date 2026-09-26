---
title: "HarnessHookDecisions"
description: "HarnessHookDecisions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHookDecisions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                         | Présence | Rôle                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `session-start` | `{ readonly instructions: string; }`                         | Requis   | Renvoyez { instructions } pour ajouter du texte aux instructions système de la passe.                                                                                          |
| `before-model`  | `never`                                                      | Requis   | Aucune décision : ne renvoyez rien pour continuer, ou levez une erreur pour faire échouer la passe.                                                                            |
| `after-model`   | `never`                                                      | Requis   | Aucune décision : ne renvoyez rien pour continuer, ou levez une erreur pour faire échouer la passe.                                                                            |
| `before-tool`   | `{ readonly deny: string; } \| { readonly input: unknown; }` | Requis   | Renvoyez { deny } pour refuser l’appel avec une raison transmise au modèle, ou { input } pour remplacer l’entrée, qui est de nouveau validée et contrôlée par les permissions. |
| `after-tool`    | `{ readonly result: ToolOutput; }`                           | Requis   | Renvoyez { result } pour remplacer le texte ou l’indicateur d’erreur envoyés au modèle.                                                                                        |
| `stop`          | `{ readonly continue: string; }`                             | Requis   | Renvoyez { continue } avec un message pour refuser la réponse finale ; le message est envoyé comme message utilisateur suivant. Borné par maxSteps.                            |

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
