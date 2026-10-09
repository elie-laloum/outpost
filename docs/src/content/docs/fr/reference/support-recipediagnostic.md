---
title: "RecipeDiagnostic"
description: "RecipeDiagnostic — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                | Type                            | Présence  | Rôle                                                                                                         |
| ------------------ | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `publicationId`    | `string \| undefined`           | Optionnel | Identifiant du journal de publication conservé après échec ; les tâches conservent leur statut terminé.      |
| `publicationState` | `string \| undefined`           | Optionnel | État distinct de rollback ou de récupération pour une publication échouée, indépendant de la fin des tâches. |
| `message`          | `string`                        | Requis    | Message d’erreur borné.                                                                                      |
| `code`             | `string \| undefined`           | Optionnel | Code d’erreur Outpost lorsque l’erreur est une OutpostError.                                                 |
| `status`           | `number \| undefined`           | Optionnel | Statut du processus en échec lorsque l’erreur sous-jacente le fournit.                                       |
| `stdout`           | `string \| undefined`           | Optionnel | Sortie standard bornée capturée pour la commande en échec.                                                   |
| `stderr`           | `string \| undefined`           | Optionnel | Sortie d’erreur bornée capturée pour la commande en échec.                                                   |
| `cause`            | `RecipeDiagnostic \| undefined` | Optionnel | Cause imbriquée conservée jusqu’à la limite de profondeur du diagnostic.                                     |

## Signature

```ts
export interface RecipeDiagnostic {
  readonly publicationId?: string;
  readonly publicationState?: string;
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly cause?: RecipeDiagnostic;
}
```
