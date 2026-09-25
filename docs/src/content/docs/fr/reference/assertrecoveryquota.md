---
title: "assertRecoveryQuota"
description: "assertRecoveryQuota — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { assertRecoveryQuota } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecte le stockage de récupération et échoue si les octets observés plus la réservation demandée dépassent maxBytes, ou si l’inspection ne permet pas de décider. Ce contrôle ne réserve pas d’espace et n’impose pas de quota physique ; reserveRecoveryStorage coordonne les écrivains coopératifs.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                    | Type                     | Présence  | Rôle                                                                                                                             |
| ---------------------- | ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `RecoveryQuotaOptions`   | Requis    | Dépôt, octets admis maximaux, octets supplémentaires demandés et limite d’inspection.                                            |
| `options.transporter`  | `Transport \| undefined` | Optionnel | Mesure les octets utiles de ce transport objet au lieu des fichiers locaux du dépôt. C’est une observation, pas une réservation. |
| `options.repository`   | `string \| undefined`    | Optionnel | Checkout Git hôte ciblé.                                                                                                         |
| `options.maxBytes`     | `number`                 | Requis    | Total maximal admis du stockage observé et des réservations actives, en octets.                                                  |
| `options.reserveBytes` | `number \| undefined`    | Optionnel | Octets supplémentaires demandés à l’admission en plus du stockage déjà utilisé.                                                  |
| `options.maxEntries`   | `number \| undefined`    | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                        |

## Retour

`Promise<void>`

## Signature

```ts
export declare function assertRecoveryQuota(
  options: RecoveryQuotaOptions,
): Promise<void>;
```

## Contrats associés

- [RecoveryQuotaOptions](../recoveryquotaoptions/)
