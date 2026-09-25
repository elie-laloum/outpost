---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                              | Présence  | Rôle                                                                                                                           |
| ----------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`        | `string`                          | Requis    | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                                            |
| `file`      | `string`                          | Requis    | Chemin hôte du fichier de transcript natif.                                                                                    |
| `reference` | `TransportReference \| undefined` | Optionnel | Index distant optionnel de la conversation avec sa révision exacte. file reste un transcript local lisible pour compatibilité. |
| `format`    | `string`                          | Requis    | Format de transcript compris par le store de conversations propriétaire.                                                       |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly reference?: TransportReference;
  readonly format: string;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
