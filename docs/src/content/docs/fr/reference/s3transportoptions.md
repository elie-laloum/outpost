---
title: "S3TransportOptions"
description: "S3TransportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { S3TransportOptions } from "@elie-laloum/outpost/transports/s3";
```

## Paramètres et propriétés

| Nom      | Type                  | Présence  | Rôle                                                                                                                                                                      |
| -------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client` | `S3Client`            | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes. |
| `bucket` | `string`              | Requis    | Bucket existant prenant en charge PUT et DELETE conditionnels ; l’adaptateur ne crée pas de bucket.                                                                       |
| `prefix` | `string \| undefined` | Optionnel | Préfixe privé optionnel des objets Outpost. Garder les objets sans rapport hors de ce préfixe ; racine du bucket par défaut.                                              |

## Signature

```ts
import type { S3Client } from "@aws-sdk/client-s3";

export interface S3TransportOptions {
  readonly client: S3Client;
  readonly bucket: string;
  readonly prefix?: string;
}
```
