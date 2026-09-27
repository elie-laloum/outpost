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

| Nom          | Type                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`     | `S3Client`                                  | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes.                                                                                                                                                                                                                                                                                      |
| `bucket`     | `string`                                    | Requis    | Bucket privé existant prenant en charge PUT conditionnel et la pagination, ainsi que DELETE conditionnel dans le mode de suppression par défaut. L’adaptateur ne crée pas de bucket.                                                                                                                                                                                                                                                                           |
| `prefix`     | `string \| undefined`                       | Optionnel | Préfixe privé optionnel des objets Outpost. Garder les objets sans rapport hors de ce préfixe ; racine du bucket par défaut.                                                                                                                                                                                                                                                                                                                                   |
| `deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optionnel | "conditional" (défaut) exige DELETE conditionnel atomique. "tombstone" supprime via des marqueurs PUT conditionnels pour les endpoints comme R2 ; lectures et listes masquent les marqueurs, remplaçables par création conditionnelle. Tous les écrivains d’un préfixe doivent choisir le même mode. Chaque marqueur conserve une enveloppe de 1 Kio et le listing ajoute un HEAD par objet ; purger physiquement seulement après arrêt de tous les écrivains. |

## Signature

```ts
import type { S3Client } from "@aws-sdk/client-s3";

export interface S3TransportOptions {
  readonly client: S3Client;
  readonly bucket: string;
  readonly prefix?: string;
  readonly deleteMode?: "conditional" | "tombstone";
}
```
