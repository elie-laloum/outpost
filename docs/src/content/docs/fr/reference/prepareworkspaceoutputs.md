---
title: "prepareWorkspaceOutputs"
description: "prepareWorkspaceOutputs — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { prepareWorkspaceOutputs } from "@elie-laloum/outpost";
```

## Rôle et comportement

Capture les manifests attendus de destination avant exécution pour la publication protégée, sans écrire les sorties.

[Exemple complet et règles détaillées](../../guide/publishing-files/).

## Paramètres et propriétés

| Nom         | Type                                | Présence | Rôle                                                                                                        |
| ----------- | ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `workspace` | `FileWorkspace`                     | Requis   | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.              |
| `outputs`   | `readonly WorkspaceOutputOptions[]` | Requis   | Publications protégées déclarées, exécutées seulement après réussite du travail et fermeture de la sandbox. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function prepareWorkspaceOutputs(
  workspace: FileWorkspace,
  outputs: readonly WorkspaceOutputOptions[],
): Promise<void>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
