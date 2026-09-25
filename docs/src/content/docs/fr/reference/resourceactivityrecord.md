---
title: "ResourceActivityRecord"
description: "ResourceActivityRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceActivityRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                                 | Présence  | Rôle                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------- |
| `version`       | `1`                                                                                  | Requis    | Version de ce format d’enregistrement sérialisé ; actuellement 1.                                              |
| `id`            | `string`                                                                             | Requis    | Identité locale de l’enregistrement d’activité de sandbox.                                                     |
| `pid`           | `number`                                                                             | Requis    | Identifiant du processus hôte possédant l’activité de sandbox enregistrée.                                     |
| `identity`      | `LocalProcessIdentity \| undefined`                                                  | Optionnel | Identité d’hôte, démarrage et début de processus utilisée pour évaluer la possession au-delà du seul PID.      |
| `provider`      | `string`                                                                             | Requis    | Nom du provider possédant la sandbox enregistrée.                                                              |
| `placement`     | `"mounted" \| "remote" \| "host"`                                                    | Requis    | Mode d’accès au workspace : checkout hôte monté, checkout distant synchronisé ou exécution directe sur l’hôte. |
| `workspace`     | `string`                                                                             | Requis    | Chemin hôte du workspace associé à la sandbox enregistrée.                                                     |
| `createdAt`     | `string`                                                                             | Requis    | Horodatage ISO de création de l’enregistrement local d’activité.                                               |
| `updatedAt`     | `string`                                                                             | Requis    | Horodatage ISO de dernière mise à jour de l’enregistrement local d’activité.                                   |
| `phase`         | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Requis    | Dernière phase de cycle de vie de sandbox enregistrée localement.                                              |
| `operations`    | `readonly ResourceOperation[]`                                                       | Requis    | Opérations actuellement enregistrées comme actives pour cette sandbox.                                         |
| `lastOperation` | `ResourceOperationResult \| undefined`                                               | Optionnel | Dernière opération locale terminée, avec son résultat et ses horodatages.                                      |
| `lastFailure`   | `ResourceOperationResult \| undefined`                                               | Optionnel | Dernière opération enregistrée en échec, conservée après les succès ultérieurs.                                |

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
