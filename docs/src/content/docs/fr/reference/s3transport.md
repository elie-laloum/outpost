---
title: "s3Transport"
description: "s3Transport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { s3Transport } from "@elie-laloum/outpost/transports/s3";
```

## Rôle et comportement

Crée un transport objet avec le S3Client de l’appelant. Les lectures GET sont bornées, PUT et DELETE sont conditionnels et le listing suit la pagination. Chaque enveloppe écrite comprend une nouvelle identité, empêchant la réutilisation d’une révision avec des contenus identiques. Exige le SDK AWS optionnel et un endpoint respectant ces garanties.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom              | Type                  | Présence  | Rôle                                                                                                                                                                      |
| ---------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `S3TransportOptions`  | Requis    | Client S3 appartenant à l’appelant, bucket et préfixe objet isolé.                                                                                                        |
| `options.client` | `S3Client`            | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes. |
| `options.bucket` | `string`              | Requis    | Bucket existant prenant en charge PUT et DELETE conditionnels ; l’adaptateur ne crée pas de bucket.                                                                       |
| `options.prefix` | `string \| undefined` | Optionnel | Préfixe privé optionnel des objets Outpost. Garder les objets sans rapport hors de ce préfixe ; racine du bucket par défaut.                                              |

## Retour

`Transport`

## Signature

```ts
export declare function s3Transport(options: S3TransportOptions): Transport;
```

## Contrats associés

- [S3TransportOptions](../s3transportoptions/)
- [Transport](../transport/)
