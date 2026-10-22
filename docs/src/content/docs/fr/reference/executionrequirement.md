---
title: "ExecutionRequirement"
description: "ExecutionRequirement — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ExecutionRequirement } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                                                                        | Présence          | Rôle                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"binding" \| "agent"`                                                      | Requis            | binding pour un mode de liaison que le fournisseur de sandbox doit prendre en charge, agent pour une capacité qu’un agent doit avoir déclarée.                       |
| `binding`    | `FileWorkspaceBinding`                                                      | Selon la variante | Avec kind binding : le mode de liaison requis par la source du workspace, comparé à workspaces.bindings du fournisseur.                                              |
| `agent`      | `string`                                                                    | Selon la variante | Avec kind agent : le nom de l’agent qui doit fournir la capacité.                                                                                                    |
| `capability` | `"continuation" \| "dispatch" \| "interactive" \| "liveInput" \| "repairs"` | Selon la variante | Avec kind agent : la capacité de workspace de fichiers requise, par exemple dispatch pour toute exécution ou continuation lorsque settings reprend une conversation. |

## Signature

```ts
export type ExecutionRequirement =
  | {
      readonly kind: "binding";
      readonly binding: FileWorkspaceBinding;
    }
  | {
      readonly kind: "agent";
      readonly agent: string;
      readonly capability: FileAgentCapability;
    };
```

## Contrats associés

- [FileAgentCapability](../fileagentcapability/)
- [FileWorkspaceBinding](../support-fileworkspacebinding/)
