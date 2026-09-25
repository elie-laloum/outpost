---
title: "localTransport"
description: "localTransport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { localTransport } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un transport d’objets versionnés dans un dossier privé. Les objets binaires utilisent une enveloppe distincte des anciens stores de fichiers. Les verrous de processus locaux sérialisent les mutations conditionnelles ; cet adaptateur n’établit pas de propriété NFS distribuée.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                 | Type                    | Présence | Rôle                                                                                                                                                                         |
| ------------------- | ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalTransportOptions` | Requis   | Dossier racine privé pour le format local d’objets versionnés.                                                                                                               |
| `options.directory` | `string`                | Requis   | Racine des objets et verrous de mutation locaux ; résolue à l’appel de la fabrique. Les dossiers symboliques sont refusés. Ce format diffère des anciens stores de fichiers. |

## Retour

`Transport`

## Signature

```ts
export declare function localTransport(
  options: LocalTransportOptions,
): Transport;
```

## Contrats associés

- [LocalTransportOptions](../localtransportoptions/)
- [Transport](../transport/)
