---
title: "pruneS3Tombstones"
description: "pruneS3Tombstones — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pruneS3Tombstones } from "@elie-laloum/outpost/transports/s3";
```

## Rôle et comportement

Supprime physiquement les tombstones sous un préfixe S3 explicite après arrêt de tous les écrivains. Refuse l’absence de writersStopped, conserve les objets vivants vides et renvoie le nombre supprimé. Maintenance hors ligne uniquement : les stores compatibles peuvent ignorer une suppression conditionnelle.

[Exemple complet et règles détaillées](../../guide/object-storage/).

## Paramètres et propriétés

| Nom                      | Type                       | Présence  | Rôle                                                                                                                                                                                                        |
| ------------------------ | -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `S3TombstonePruneOptions`  | Requis    | Préfixe S3 explicite et autorisation après arrêt des écrivains pour la suppression hors ligne des marqueurs.                                                                                                |
| `options.prefix`         | `string`                   | Requis    | Préfixe de transport non vide ; la suppression est limitée à ses descendants.                                                                                                                               |
| `options.writersStopped` | `true`                     | Requis    | Vaut obligatoirement true après arrêt de tous les écrivains du préfixe ; gardez-les arrêtés jusqu’à la fin.                                                                                                 |
| `options.signal`         | `AbortSignal \| undefined` | Optionnel | Signal d’annulation facultatif ; les suppressions déjà effectuées restent appliquées.                                                                                                                       |
| `options.client`         | `S3Client`                 | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes.                                   |
| `options.bucket`         | `string`                   | Requis    | Bucket privé existant qui prend en charge PUT conditionnel et la pagination, ainsi que DELETE conditionnel dans le mode de suppression par défaut. Le transport ne le crée jamais ; un nom vide est refusé. |

## Retour

`Promise<number>`

## Signature

```ts
export declare function pruneS3Tombstones(
  options: S3TombstonePruneOptions,
): Promise<number>;
```

## Contrats associés

- [S3TombstonePruneOptions](../s3tombstonepruneoptions/)
