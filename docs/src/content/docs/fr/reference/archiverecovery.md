---
title: "archiveRecovery"
description: "archiveRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { archiveRecovery } from "@elie-laloum/outpost";
```

## Rôle et comportement

Envoie un snapshot vérifié d’un transfert de récupération local par blocs de 4 Mio, publie son manifeste en dernier et renvoie la référence du manifeste. Le dossier source est conservé. Un envoi interrompu peut laisser des blocs non référencés mais ne publie jamais de manifeste.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom                   | Type                          | Présence  | Rôle                                                                                                                                        |
| --------------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveOptions`      | Requis    | Transfert de récupération local vérifié, transport de destination et limite totale des contenus.                                            |
| `options.directory`   | `string`                      | Requis    | Transfert existant contenant state.json, checksums.json et les patches, bundles et fichiers supplémentaires requis.                         |
| `options.maxBytes`    | `number \| undefined`         | Optionnel | Limite totale des contenus, 1 Gio par défaut ; s’applique au snapshot local et à l’envoi.                                                   |
| `options.transporter` | `Transport`                   | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |
| `observation`         | `ObservationHub \| undefined` | Optionnel | Hub qui reçoit les événements de début et de fin de l’envoi de l’archive.                                                                   |

## Retour

`Promise<TransportReference>`

## Signature

```ts
export declare function archiveRecovery(
  options: RecoveryArchiveOptions,
  observation?: ObservationHub,
): Promise<TransportReference>;
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [RecoveryArchiveOptions](../recoveryarchiveoptions/)
- [TransportReference](../transportreference/)
