---
title: "RecordedCommit"
description: "RecordedCommit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedCommit } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type               | Présence | Rôle                                                                                                         |
| ----------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `oid`       | `string`           | Requis   | Identifiant d’objet du commit enregistré.                                                                    |
| `tree`      | `string`           | Requis   | Identifiant de l’arbre que le patch doit reproduire.                                                         |
| `author`    | `RecordedIdentity` | Requis   | Identité et date d’auteur restaurées sur le commit rejoué.                                                   |
| `committer` | `RecordedIdentity` | Requis   | Identité et date du committer restaurées sur le commit rejoué.                                               |
| `message`   | `string`           | Requis   | Message de commit exact, sans nettoyage.                                                                     |
| `patch`     | `string`           | Requis   | Patch Git binaire depuis le commit parent, vérifié à l’enregistrement ; vide pour un commit sans changement. |

## Signature

```ts
export interface RecordedCommit {
  readonly oid: string;
  readonly tree: string;
  readonly author: RecordedIdentity;
  readonly committer: RecordedIdentity;
  readonly message: string;
  readonly patch: string;
}
```

## Contrats associés

- [RecordedIdentity](../recordedidentity/)
