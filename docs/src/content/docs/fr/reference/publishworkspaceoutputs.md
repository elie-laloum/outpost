---
title: "publishWorkspaceOutputs"
description: "publishWorkspaceOutputs — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { publishWorkspaceOutputs } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publie les fichiers settled sélectionnés par création exclusive ou mise à jour protégée. Un échec tente un rollback conditionnel et conserve modifications externes et preuves de récupération. La publication valide et prépare toutes les sorties sélectionnées avant mutation, journalise les opérations via Transport et met les entrées remplacées en quarantaine sur le système de fichiers de destination. Elle ne remplace pas atomiquement toute l’arborescence. Le retour arrière ne restaure que les chemins correspondant encore aux effets de la publication ; les modifications concurrentes et sauvegardes nécessaires restent disponibles pour une récupération explicite. Les fichiers doivent être stabilisés, sans opération de sandbox active ; la publication ne revient pas sur les effets des montages sources inscriptibles.

[Exemple complet et règles détaillées](../../guide/publishing-files/).

## Paramètres et propriétés

| Nom           | Type                     | Présence  | Rôle                                                                                                             |
| ------------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `workspace`   | `FileWorkspace`          | Requis    | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.                   |
| `declaration` | `WorkspaceOutputOptions` | Requis    | Sélection relative des sorties, destination et politique explicite de création/mise à jour/suppression.          |
| `transporter` | `Transport \| undefined` | Optionnel | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials. |

## Retour

`Promise<WorkspacePublication>`

## Signature

```ts
export declare function publishWorkspaceOutputs(
  workspace: FileWorkspace,
  declaration: WorkspaceOutputOptions,
  transporter?: Transport,
): Promise<WorkspacePublication>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
- [Transport](../transport/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
