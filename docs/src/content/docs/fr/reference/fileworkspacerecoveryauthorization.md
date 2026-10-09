---
title: "FileWorkspaceRecoveryAuthorization"
description: "FileWorkspaceRecoveryAuthorization — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecoveryAuthorization } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                   | Présence  | Rôle                                                                                                                        |
| ----------------------- | ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `expectedRevision`      | `string`               | Requis    | Révision obtenue par inspection ; la récupération refuse un enregistrement persisté modifié.                                |
| `processesStopped`      | `true`                 | Requis    | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat. |
| `allocationReleased`    | `true \| undefined`    | Optionnel | Preuve explicite qu’une allocation incertaine a été fermée lorsque le provider ne peut pas la récupérer.                    |
| `adoptInterruptedFiles` | `boolean \| undefined` | Optionnel | Adopte explicitement les fichiers conservés d’une tentative interrompue après arrêt de ses processus.                       |
| `adoptMountedSource`    | `boolean \| undefined` | Optionnel | Adopte explicitement une source montée modifiée après inspection ; ne convertit jamais le montage en copie.                 |

## Signature

```ts
export interface FileWorkspaceRecoveryAuthorization {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly allocationReleased?: true;
  readonly adoptInterruptedFiles?: boolean;
  readonly adoptMountedSource?: boolean;
}
```
