---
title: "WorkspaceAllocationRecord"
description: "WorkspaceAllocationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceAllocationRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                    | Présence  | Rôle                                                                                                                                  |
| ------------ | ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`   | `string`                                                | Requis    | Identité du provider d’exécution conservée pour la récupération, sans stocker de credentials.                                         |
| `state`      | `"active" \| "released" \| "allocating" \| "uncertain"` | Requis    | État de lifecycle persisté ; les ressources incertaines ou nécessitant une récupération ne sont jamais reconstruites silencieusement. |
| `resourceId` | `string \| undefined`                                   | Optionnel | Identifiant de ressource du provider enregistré avant la fin de l’acquisition lorsque celle-ci le permet.                             |
| `reference`  | `TransportReference`                                    | Requis    | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés.                  |

## Signature

```ts
export interface WorkspaceAllocationRecord {
  readonly provider: string;
  readonly state: "allocating" | "active" | "uncertain" | "released";
  readonly resourceId?: string;
  readonly reference: TransportReference;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
