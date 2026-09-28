---
title: "WorkspaceCommitsEvent"
description: "WorkspaceCommitsEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceCommitsEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom           | Type                                                | Présence          | Rôle                                                                                                                                                                |
| ------------- | --------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`        | `"workspace-commits"`                               | Requis            | Discriminant des commits de workspace enregistrés.                                                                                                                  |
| `baseline`    | `RecordedRevision \| RecordedRevision \| undefined` | Selon la variante | Commit et arbre de départ du dispatch en sandbox ; absent si même la baseline n’a pas pu être lue.                                                                  |
| `commits`     | `readonly RecordedCommit[]`                         | Selon la variante | Commits linéaires créés par le dispatch, du plus ancien au plus récent.                                                                                             |
| `unavailable` | `string`                                            | Selon la variante | Raison de l’absence d’enregistrement : historique non linéaire ou réécrit, limite de taille, encodage non UTF-8, patch qui ne reproduit pas son arbre ou échec Git. |

## Signature

```ts
export type WorkspaceCommitsEvent =
  | {
      readonly kind: "workspace-commits";
      readonly baseline: RecordedRevision;
      readonly commits: readonly RecordedCommit[];
    }
  | {
      readonly kind: "workspace-commits";
      readonly baseline?: RecordedRevision;
      readonly unavailable: string;
    };
```

## Contrats associés

- [RecordedCommit](../recordedcommit/)
- [RecordedRevision](../recordedrevision/)
