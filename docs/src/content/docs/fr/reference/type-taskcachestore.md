---
title: "TaskCacheStore"
description: "TaskCacheStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheStore } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                                                                                              | Présence | Rôle                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `read`  | `(fingerprint: string, options?: TaskCacheAccessOptions) => Promise<TaskCacheEntry \| undefined>` | Requis   | Renvoie l’entrée valide stockée pour une empreinte, ou undefined si aucune n’existe. Le workflow revalide l’entrée et traite les erreurs comme un miss.      |
| `write` | `(entry: TaskCacheEntry, options?: TaskCacheAccessOptions) => Promise<void>`                      | Requis   | Enregistre une entrée pour son empreinte en remplaçant l’ancienne ; un échec est signalé par un événement cache failed sans changer le résultat de la tâche. |

## Signature

```ts
export interface TaskCacheStore {
  read(
    fingerprint: string,
    options?: TaskCacheAccessOptions,
  ): Promise<TaskCacheEntry | undefined>;
  write(entry: TaskCacheEntry, options?: TaskCacheAccessOptions): Promise<void>;
}
```

## Contrats associés

- [TaskCacheAccessOptions](../taskcacheaccessoptions/)
- [TaskCacheEntry](../taskcacheentry/)
