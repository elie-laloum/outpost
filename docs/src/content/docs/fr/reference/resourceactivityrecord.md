---
title: "ResourceActivityRecord"
description: "ResourceActivityRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceActivityRecord**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceActivityRecord } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom             | Type                                                                                 | Présence  | Rôle                                                                               |
| --------------- | ------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------- |
| `version`       | `1`                                                                                  | Requis    | Version de contrat ou graphe contrôlée par l’appelant.                             |
| `id`            | `string`                                                                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `pid`           | `number`                                                                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `identity`      | `LocalProcessIdentity \| undefined`                                                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `provider`      | `string`                                                                             | Requis    | Backend de l’environnement d’exécution.                                            |
| `placement`     | `"mounted" \| "remote" \| "host"`                                                    | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `workspace`     | `string`                                                                             | Requis    | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche. |
| `createdAt`     | `string`                                                                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `updatedAt`     | `string`                                                                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `phase`         | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `operations`    | `readonly ResourceOperation[]`                                                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `lastOperation` | `ResourceOperationResult \| undefined`                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `lastFailure`   | `ResourceOperationResult \| undefined`                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |

## Signature

```ts
export interface ResourceActivityRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: LocalProcessIdentity;
  readonly provider: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly workspace: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly phase: ResourcePhase;
  readonly operations: readonly ResourceOperation[];
  readonly lastOperation?: ResourceOperationResult;
  readonly lastFailure?: ResourceOperationResult;
}
```

## Contrats associés

- [LocalProcessIdentity](../support-localprocessidentity/)
- [ResourceOperation](../resourceoperation/)
- [ResourceOperationResult](../resourceoperationresult/)
- [ResourcePhase](../resourcephase/)
