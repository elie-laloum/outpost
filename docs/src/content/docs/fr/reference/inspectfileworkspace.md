---
title: "inspectFileWorkspace"
description: "inspectFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectFileWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lit l’enregistrement versionné courant du workspace et sa révision sans acquérir de sandbox ni modifier les fichiers matérialisés.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom                   | Type                             | Présence  | Rôle                                                                                                                             |
| --------------------- | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `FileWorkspaceInspectionOptions` | Requis    | Options sélectionnant la source, les capacités d’exécution ou les préconditions de récupération inspectées pour cette opération. |
| `options.runtime`     | `WorkspaceRuntime`               | Requis    | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                  |
| `options.id`          | `string`                         | Requis    | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                                 |
| `options.transporter` | `Transport \| undefined`         | Optionnel | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.                 |

## Retour

`Promise<FileWorkspaceInspection>`

## Signature

```ts
export declare function inspectFileWorkspace(
  options: FileWorkspaceInspectionOptions,
): Promise<FileWorkspaceInspection>;
```

## Contrats associés

- [FileWorkspaceInspection](../fileworkspaceinspection/)
- [FileWorkspaceInspectionOptions](../fileworkspaceinspectionoptions/)
