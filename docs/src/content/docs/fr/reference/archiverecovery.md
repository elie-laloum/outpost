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

Crée et vérifie un snapshot du transfert, envoie des blocs binaires avec empreintes puis publie le manifeste en dernier. La source est conservée. Un envoi interrompu peut laisser des blocs non référencés ; aucun manifeste incomplet n’est publié. L’archive contient les données de récupération, pas un remplacement autonome du dépôt Git source.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                     | Présence  | Rôle                                                                                                                                        |
| --------------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryArchiveOptions` | Requis    | Transfert de récupération local vérifié, transport de destination et limite totale des contenus.                                            |
| `options.directory`   | `string`                 | Requis    | Transfert existant contenant state.json, checksums.json et les patches, bundles et fichiers supplémentaires requis.                         |
| `options.maxBytes`    | `number \| undefined`    | Optionnel | Limite positive totale des contenus, 1 Gio par défaut. Les fichiers sont envoyés par blocs bornés après vérification du snapshot local.     |
| `options.transporter` | `Transport`              | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`Promise<TransportReference>`

## Signature

```ts
export declare function archiveRecovery(
  options: RecoveryArchiveOptions,
): Promise<TransportReference>;
```

## Contrats associés

- [RecoveryArchiveOptions](../recoveryarchiveoptions/)
- [TransportReference](../transportreference/)
