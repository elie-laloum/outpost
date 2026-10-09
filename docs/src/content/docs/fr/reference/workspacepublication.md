---
title: "WorkspacePublication"
description: "WorkspacePublication — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePublication } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                 | Présence | Rôle                                                                                                                                  |
| ------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                                             | Requis   | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                                      |
| `destination` | `string`                                             | Requis   | Destination hôte conservant les chemins relatifs sélectionnés ; le chevauchement d’une source inscriptible active est refusé.         |
| `state`       | `"complete" \| "rolled-back" \| "recovery-required"` | Requis   | État de lifecycle persisté ; les ressources incertaines ou nécessitant une récupération ne sont jamais reconstruites silencieusement. |
| `created`     | `readonly string[]`                                  | Requis   | Chemins relatifs des opérations de publication correspondantes vérifiées.                                                             |
| `replaced`    | `readonly string[]`                                  | Requis   | Chemins relatifs des opérations de publication correspondantes vérifiées.                                                             |
| `deleted`     | `readonly string[]`                                  | Requis   | Chemins relatifs des opérations de publication correspondantes vérifiées.                                                             |
| `reference`   | `TransportReference`                                 | Requis   | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés.                  |

## Signature

```ts
export interface WorkspacePublication {
  readonly id: string;
  readonly destination: string;
  readonly state: "complete" | "rolled-back" | "recovery-required";
  readonly created: readonly string[];
  readonly replaced: readonly string[];
  readonly deleted: readonly string[];
  readonly reference: TransportReference;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
