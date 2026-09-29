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

| Nom          | Type                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`     | `S3Client`                                  | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes.                                                                                                                                                       |
| `bucket`     | `string`                                    | Requis    | Bucket privé existant qui prend en charge PUT conditionnel et la pagination, ainsi que DELETE conditionnel dans le mode de suppression par défaut. Le transport ne le crée jamais ; un nom vide est refusé.                                                                                                                     |
| `prefix`     | `string \| undefined`                       | Optionnel | Préfixe des clés de tous les objets Outpost, racine du bucket par défaut ; doit être une clé de transport valide, slash final accepté. Gardez les objets sans rapport en dehors.                                                                                                                                                |
| `deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optionnel | Fonctionnement de remove() : "conditional" (défaut) envoie un DELETE conditionnel ; "tombstone", pour R2, remplace l’objet par un marqueur masqué de 1 Kio et fait envoyer à list() un HEAD par objet. Tous les écrivains d’un préfixe doivent utiliser le même mode ; ne purgez les marqueurs qu’après les avoir tous arrêtés. |

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
