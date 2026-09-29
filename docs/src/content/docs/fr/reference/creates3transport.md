---
title: "createS3Transport"
description: "createS3Transport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
```

## Rôle et comportement

Crée un transport objet avec le S3Client de l’appelant. Les lectures GET sont bornées et les écritures PUT conditionnelles. La suppression par défaut exige DELETE conditionnel atomique. Utilisez deleteMode "tombstone" pour R2 : des marqueurs PUT conditionnels bloquent suppressions et recréations périmées, restent physiquement stockés et sont masqués des lectures et listes paginées avec des requêtes HEAD supplémentaires. Choisissez le même mode pour tous les écrivains du préfixe et arrêtez-les avant de purger les marqueurs. Chaque enveloppe porte une nouvelle identité, y compris pour des contenus identiques et les marqueurs. Le client SDK AWS optionnel reste la propriété de l’appelant.

[Exemple complet et règles détaillées](../../guide/storage/).

## Paramètres et propriétés

| Nom                  | Type                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `S3TransportOptions`                        | Requis    | Client S3 appartenant à l’appelant, bucket et préfixe objet isolé.                                                                                                                                                                                                                                                                                                                                                                                             |
| `options.client`     | `S3Client`                                  | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes.                                                                                                                                                                                                                                                                                      |
| `options.bucket`     | `string`                                    | Requis    | Bucket privé existant prenant en charge PUT conditionnel et la pagination, ainsi que DELETE conditionnel dans le mode de suppression par défaut. L’adaptateur ne crée pas de bucket.                                                                                                                                                                                                                                                                           |
| `options.prefix`     | `string \| undefined`                       | Optionnel | Préfixe privé optionnel des objets Outpost. Garder les objets sans rapport hors de ce préfixe ; racine du bucket par défaut.                                                                                                                                                                                                                                                                                                                                   |
| `options.deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optionnel | "conditional" (défaut) exige DELETE conditionnel atomique. "tombstone" supprime via des marqueurs PUT conditionnels pour les endpoints comme R2 ; lectures et listes masquent les marqueurs, remplaçables par création conditionnelle. Tous les écrivains d’un préfixe doivent choisir le même mode. Chaque marqueur conserve une enveloppe de 1 Kio et le listing ajoute un HEAD par objet ; purger physiquement seulement après arrêt de tous les écrivains. |

## Retour

`Transport`

## Signature

```ts
export declare function createS3Transport(
  options: S3TransportOptions,
): Transport;
```

## Contrats associés

- [S3TransportOptions](../s3transportoptions/)
- [Transport](../transport/)
