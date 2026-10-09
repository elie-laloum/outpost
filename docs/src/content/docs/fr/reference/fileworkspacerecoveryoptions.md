---
title: "FileWorkspaceRecoveryOptions"
description: "FileWorkspaceRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecoveryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                                                                                                                                                                                         | Présence  | Rôle                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `expectedRevision` | `string`                                                                                                                                                                                                     | Requis    | Révision obtenue par inspection ; la récupération refuse un enregistrement persisté modifié.                                            |
| `processesStopped` | `true`                                                                                                                                                                                                       | Requis    | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat.             |
| `sandboxProvider`  | `SandboxProvider \| undefined`                                                                                                                                                                               | Optionnel | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.       |
| `runtime`          | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                         |
| `retention`        | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.               |
| `portable`         | `boolean \| undefined`                                                                                                                                                                                       | Optionnel | Restaure un snapshot vérifié dans une nouvelle matérialisation possédée ; les sources montées doivent rester accessibles et inchangées. |
| `recover`          | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.       |

## Signature

```ts
export interface FileWorkspaceRecoveryOptions extends RestoreFileWorkspaceOptions {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly sandboxProvider?: SandboxProvider;
}
```

## Contrats associés

- [RestoreFileWorkspaceOptions](../restorefileworkspaceoptions/)
- [SandboxProvider](../sandboxprovider/)
