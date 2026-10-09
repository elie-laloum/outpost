---
title: "WorkspaceConversationArchive"
description: "WorkspaceConversationArchive — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceConversationArchive } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                 | Présence | Rôle                                                                                                                 |
| --------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `id`      | `string`             | Requis   | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                     |
| `format`  | `string`             | Requis   | Version de l’enveloppe persistée ; les versions inconnues sont refusées.                                             |
| `path`    | `string`             | Requis   | Chemin relatif validé conservant son préfixe ; traversées et chemins de contrôle sont refusés.                       |
| `archive` | `TransportReference` | Requis   | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés. |

## Signature

```ts
export interface WorkspaceConversationArchive {
  readonly id: string;
  readonly format: string;
  readonly path: string;
  readonly archive: TransportReference;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
