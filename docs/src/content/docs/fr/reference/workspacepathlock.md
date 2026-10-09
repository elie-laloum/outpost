---
title: "WorkspacePathLock"
description: "WorkspacePathLock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePathLock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                        | Présence  | Rôle                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | `string`                                    | Requis    | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                                                                                                                                                |
| `directory`           | `string`                                    | Requis    | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                                                                                                                                            |
| `writable`            | `boolean`                                   | Requis    | Intention d’écriture ; les chemins qui se chevauchent sont refusés lorsqu’un propriétaire peut écrire.                                                                                                                                          |
| `identity`            | `WorkspacePathGate \| undefined`            | Optionnel | Identité device/inode utilisée pour détecter les remplacements et les aliases connus du filesystem.                                                                                                                                             |
| `ancestors`           | `readonly WorkspacePathGate[] \| undefined` | Optionnel | Identités filesystem des ancêtres existants utilisées pour détecter les aliases qui se chevauchent.                                                                                                                                             |
| `excludedDirectories` | `readonly string[] \| undefined`            | Optionnel | Sous-répertoires de contrôle canoniques exclus du verrou de lecture d’une source copiée. Les matérialisations possédées y coexistent ; les writers de données et les montages complets restent protégés. Les anciens verrous omettent ce champ. |

## Signature

```ts
export interface WorkspacePathLock {
  readonly id: string;
  readonly directory: string;
  readonly writable: boolean;
  readonly identity?: WorkspacePathGate;
  readonly ancestors?: readonly WorkspacePathGate[];
  readonly excludedDirectories?: readonly string[];
}
```

## Contrats associés

- [WorkspacePathGate](../support-workspacepathgate/)
