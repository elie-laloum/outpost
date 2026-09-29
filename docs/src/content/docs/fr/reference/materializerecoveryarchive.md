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

Télécharge une archive de récupération dans destination, en vérifiant la révision et le SHA-256 de chaque bloc puis les sommes de contrôle du transfert, et renvoie destination. Liens symboliques et modes de fichiers sont restaurés ; en cas d’échec, la destination partielle est conservée. Ramenez ensuite le travail avec planRecoveryRestore() et restoreRecoveryTransfer().

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom                   | Type                            | Présence  | Rôle                                                                                                                                            |
| --------------------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveRestoreOptions` | Requis    | Référence exacte d’archive, transport, nouvelle destination locale et limite de vérification.                                                   |
| `options.reference`   | `TransportReference`            | Requis    | Manifeste versionné renvoyé par archiveRecovery ; chaque révision de bloc et SHA-256 est vérifié.                                               |
| `options.destination` | `string`                        | Requis    | Nouveau dossier local dont le parent existe. Les destinations existantes sont refusées ; les données partielles sont conservées en cas d’échec. |
| `options.maxBytes`    | `number \| undefined`           | Optionnel | Limite positive totale des contenus restaurés, 1 Gio par défaut ; borne aussi la vérification d’intégrité de récupération.                      |
| `options.transporter` | `Transport`                     | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.     |
| `observation`         | `ObservationHub \| undefined`   | Optionnel | Hub qui reçoit les événements de début et de fin du téléchargement de l’archive.                                                                |

## Retour

`Promise<string>`

## Signature

```ts
export declare function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
  observation?: ObservationHub,
): Promise<string>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryArchiveRestoreOptions](../recoveryarchiverestoreoptions/)
