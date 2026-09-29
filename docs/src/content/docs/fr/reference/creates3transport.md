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

Crée un transport sur votre S3Client, importé depuis @elie-laloum/outpost/transports/s3. Les écritures sont des PUT conditionnels et les lectures refusent les objets plus grands que maxBytes ; la suppression est un DELETE conditionnel, ou un marqueur masqué avec deleteMode "tombstone" pour R2. Outpost ne détruit jamais le client.

[Exemple complet et règles détaillées](../../guide/object-storage/).

## Paramètres et propriétés

| Nom                  | Type                                        | Présence  | Rôle                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `S3TransportOptions`                        | Requis    | Client S3 appartenant à l’appelant, bucket et préfixe objet isolé.                                                                                                                                                                                                                                                              |
| `options.client`     | `S3Client`                                  | Requis    | S3Client configuré par l’appelant avec région, identifiants et éventuel endpoint compatible. Outpost ne le détruit pas et ne transmet pas ses identifiants aux sandboxes.                                                                                                                                                       |
| `options.bucket`     | `string`                                    | Requis    | Bucket privé existant qui prend en charge PUT conditionnel et la pagination, ainsi que DELETE conditionnel dans le mode de suppression par défaut. Le transport ne le crée jamais ; un nom vide est refusé.                                                                                                                     |
| `options.prefix`     | `string \| undefined`                       | Optionnel | Préfixe des clés de tous les objets Outpost, racine du bucket par défaut ; doit être une clé de transport valide, slash final accepté. Gardez les objets sans rapport en dehors.                                                                                                                                                |
| `options.deleteMode` | `"conditional" \| "tombstone" \| undefined` | Optionnel | Fonctionnement de remove() : "conditional" (défaut) envoie un DELETE conditionnel ; "tombstone", pour R2, remplace l’objet par un marqueur masqué de 1 Kio et fait envoyer à list() un HEAD par objet. Tous les écrivains d’un préfixe doivent utiliser le même mode ; ne purgez les marqueurs qu’après les avoir tous arrêtés. |

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
