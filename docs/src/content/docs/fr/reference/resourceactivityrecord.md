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

| Nom               | Type                                                                                 | Présence  | Rôle                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`         | `1`                                                                                  | Requis    | Version de ce format d’enregistrement sérialisé ; actuellement 1.                                                                                                                                       |
| `id`              | `string`                                                                             | Requis    | UUID aléatoire de l’enregistrement, stocké sous resources/&lt;id>.json.                                                                                                                                 |
| `pid`             | `number`                                                                             | Requis    | PID du processus Outpost qui a provisionné la sandbox, et non d’un processus qu’elle exécute.                                                                                                           |
| `identity`        | `LocalProcessIdentity \| undefined`                                                  | Optionnel | Hôte, démarrage, espace de noms PID et heure de début du processus auteur, pour distinguer un propriétaire vivant d’un PID réutilisé. Absente hors Linux ; la possession est alors unknown.             |
| `sandboxProvider` | `string`                                                                             | Requis    | Nom du provider qui a alloué la sandbox, comme docker ou vercel.                                                                                                                                        |
| `placement`       | `"mounted" \| "remote" \| "host"`                                                    | Requis    | Accès de la sandbox au workspace : mounted (worktree hôte monté, Docker ou Podman), remote (copie synchronisée avec l’hôte : Vercel, Daytona, Firecracker, conteneurs isolés) ou host (provider local). |
| `workspace`       | `string`                                                                             | Requis    | Chemin hôte du worktree sur lequel travaille la sandbox. La rétention de récupération ne supprime jamais un workspace nommé par un enregistrement.                                                      |
| `createdAt`       | `string`                                                                             | Requis    | Horodatage ISO de l’enregistrement de la sandbox, avant son acquisition par le provider.                                                                                                                |
| `updatedAt`       | `string`                                                                             | Requis    | Horodatage ISO du dernier changement de phase ou d’opération.                                                                                                                                           |
| `phase`           | `"allocating" \| "ready" \| "closing" \| "cleanup-failed" \| "allocation-uncertain"` | Requis    | Dernière phase de cycle de vie enregistrée : allocating, ready, closing, cleanup-failed ou allocation-uncertain.                                                                                        |
| `operations`      | `readonly ResourceOperation[]`                                                       | Requis    | Opérations en cours lors de l’écriture de l’enregistrement, une entrée par type avec son nombre d’exécutions simultanées. Vide quand la sandbox est inactive.                                           |
| `lastOperation`   | `ResourceOperationResult \| undefined`                                               | Optionnel | Dernière opération terminée, réussie ou en échec.                                                                                                                                                       |
| `lastFailure`     | `ResourceOperationResult \| undefined`                                               | Optionnel | Dernière opération enregistrée en échec, conservée après les succès ultérieurs.                                                                                                                         |

## Signature

```ts
export interface ResourceActivityRecord {
  readonly version: 1;
  readonly id: string;
  readonly pid: number;
  readonly identity?: LocalProcessIdentity;
  readonly sandboxProvider: string;
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
