---
title: "materializeRecoveryArchive"
description: "materializeRecoveryArchive — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { materializeRecoveryArchive } from "@elie-laloum/outpost";
```

## Rôle et comportement

Télécharge une archive versionnée dans un nouveau dossier local en conservant les modes et liens symboliques pris en charge. Vérifie révisions, SHA-256 et sommes de contrôle de récupération. Conserve la source et toute destination partielle en cas d’échec. Utiliser ensuite les API de planification et restauration avec le dépôt source pour produire un checkout.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                            | Présence  | Rôle                                                                                                                                            |
| --------------------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveRestoreOptions` | Requis    | Référence exacte d’archive, transport, nouvelle destination locale et limite de vérification.                                                   |
| `options.reference`   | `TransportReference`            | Requis    | Manifeste versionné renvoyé par archiveRecovery ; chaque révision de bloc et SHA-256 est vérifié.                                               |
| `options.destination` | `string`                        | Requis    | Nouveau dossier local dont le parent existe. Les destinations existantes sont refusées ; les données partielles sont conservées en cas d’échec. |
| `options.maxBytes`    | `number \| undefined`           | Optionnel | Limite positive totale des contenus restaurés, 1 Gio par défaut ; borne aussi la vérification d’intégrité de récupération.                      |
| `options.transporter` | `Transport`                     | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.     |

## Retour

`Promise<string>`

## Signature

```ts
export declare function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
): Promise<string>;
```

## Contrats associés

- [RecoveryArchiveRestoreOptions](../recoveryarchiverestoreoptions/)
