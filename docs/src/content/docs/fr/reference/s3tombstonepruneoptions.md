---
title: "S3TombstonePruneOptions"
description: "S3TombstonePruneOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { S3TombstonePruneOptions } from "@elie-laloum/outpost/transports/s3";
```

## Paramètres et propriétés

| Nom              | Type                       | Présence  | Rôle                                                                                                        |
| ---------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `prefix`         | `string`                   | Requis    | Préfixe de transport non vide ; la suppression est limitée à ses descendants.                               |
| `writersStopped` | `true`                     | Requis    | Vaut obligatoirement true après arrêt de tous les écrivains du préfixe ; gardez-les arrêtés jusqu’à la fin. |
| `signal`         | `AbortSignal \| undefined` | Optionnel | Signal d’annulation facultatif ; les suppressions déjà effectuées restent appliquées.                       |
| `client`         | `S3Client`                 | Requis    | Client S3 appartenant à l’appelant.                                                                         |
| `bucket`         | `string`                   | Requis    | Bucket contenant le préfixe du transport.                                                                   |

## Signature

```ts
export interface S3TombstonePruneOptions extends Pick<
  S3TransportOptions,
  "client" | "bucket"
> {
  readonly prefix: string;
  readonly writersStopped: true;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [S3TransportOptions](../s3transportoptions/)
