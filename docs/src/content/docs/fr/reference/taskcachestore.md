---
title: "taskCacheStore"
description: "taskCacheStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { taskCacheStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un store de cache de tâches sur un Transport appartenant à l’appelant. Les entrées sont stockées sous task-cache/<empreinte>.json ; les écritures remplacent conditionnellement les anciennes entrées et conservent celle d’un écrivain concurrent. Les lectures valident l’entrée et sa taille. Les entrées ne sont pas authentifiées : quiconque peut écrire dans le transport contrôle les résultats restaurés.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                    | Présence  | Rôle                                                                                                                                        |
| --------------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `TaskCacheStoreOptions` | Requis    | Transport qui stocke les entrées sous task-cache/ et limite optionnelle de taille des entrées.                                              |
| `options.maxBytes`    | `number \| undefined`   | Optionnel | Taille maximale positive d’une entrée sérialisée en octets, 16 Mio par défaut ; appliquée à l’écriture et à la lecture.                     |
| `options.transporter` | `Transport`             | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`TaskCacheStore`

## Signature

```ts
export declare function taskCacheStore(
  options: TaskCacheStoreOptions,
): TaskCacheStore;
```

## Contrats associés

- [TaskCacheStore](../type-taskcachestore/)
- [TaskCacheStoreOptions](../taskcachestoreoptions/)
