---
title: "RecoveryArchiveRestoreOptions"
description: "RecoveryArchiveRestoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryArchiveRestoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                            |
| ------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference`   | `TransportReference`  | Requis    | Manifeste versionné renvoyé par archiveRecovery ; chaque révision de bloc et SHA-256 est vérifié.                                               |
| `destination` | `string`              | Requis    | Nouveau dossier local dont le parent existe. Les destinations existantes sont refusées ; les données partielles sont conservées en cas d’échec. |
| `maxBytes`    | `number \| undefined` | Optionnel | Limite positive totale des contenus restaurés, 1 Gio par défaut ; borne aussi la vérification d’intégrité de récupération.                      |
| `transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.     |

## Signature

```ts
export interface RecoveryArchiveRestoreOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly destination: string;
  readonly maxBytes?: number;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
- [TransportStoreOptions](../transportstoreoptions/)
