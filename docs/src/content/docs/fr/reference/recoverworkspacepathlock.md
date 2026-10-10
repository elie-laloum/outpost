---
title: "recoverWorkspacePathLock"
description: "recoverWorkspacePathLock — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkspacePathLock } from "@elie-laloum/outpost";
```

## Rôle et comportement

Libère uniquement un verrou explicitement inspecté après confirmation par le caller de l’arrêt des processus propriétaires. Ne déduit jamais une autorisation d’un PID.

[Exemple complet et règles détaillées](../../guide/working-with-files/).

## Paramètres et propriétés

| Nom                        | Type                           | Présence | Rôle                                                                                                                        |
| -------------------------- | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | `string`                       | Requis   | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                            |
| `expectedDirectory`        | `string`                       | Requis   | Répertoire canonique inspecté qui doit correspondre au verrou abandonné exact.                                              |
| `options`                  | `WorkspacePathRecoveryOptions` | Requis   | Confirmation d’arrêt des processus et révision inspectée nécessaires pour libérer la propriété du chemin.                   |
| `options.processesStopped` | `true`                         | Requis   | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function recoverWorkspacePathLock(
  id: string,
  expectedDirectory: string,
  options: WorkspacePathRecoveryOptions,
): Promise<void>;
```

## Contrats associés

- [WorkspacePathRecoveryOptions](../workspacepathrecoveryoptions/)
