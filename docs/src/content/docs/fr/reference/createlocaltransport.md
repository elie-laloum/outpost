---
title: "createLocalTransport"
description: "createLocalTransport — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createLocalTransport } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un transport qui stocke chaque clé dans un fichier réservé au propriétaire sous &lt;directory>/objects, créé à la première écriture. Des fichiers de verrou par clé sérialisent les mutations entre processus d’une même machine ; une mutation qui attend son verrou plus de 30000 ms est refusée. Il n’offre aucune propriété distribuée sur NFS ou un autre montage partagé.

[Exemple complet et règles détaillées](../../guide/storage/).

## Paramètres et propriétés

| Nom                 | Type                    | Présence | Rôle                                                                                                                                                                                         |
| ------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `LocalTransportOptions` | Requis   | Dossier qui contient les objets et leurs fichiers de verrou.                                                                                                                                 |
| `options.directory` | `string`                | Requis   | Dossier racine, résolu à l’appel de la fabrique ; les objets vont sous objects/ et les verrous sous .outpost/locks. Une racine qui est un lien symbolique fait échouer la première écriture. |

## Retour

`Transport`

## Signature

```ts
export declare function createLocalTransport(
  options: LocalTransportOptions,
): Transport;
```

## Contrats associés

- [LocalTransportOptions](../localtransportoptions/)
- [Transport](../transport/)
