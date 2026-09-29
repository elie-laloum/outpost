---
title: "ReplayAgentOptions"
description: "ReplayAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayAgentOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                  | Présence  | Rôle                                                                                                                                                                                                             |
| ------------ | ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `journal`    | `readonly unknown[]`                  | Requis    | Entrées renvoyées par readJournal pour un dispatch. Enregistrez avec logging.replayable pour inclure les commits du workspace.                                                                                   |
| `divergence` | `ReplayDivergencePolicy \| undefined` | Optionnel | Politique de divergence, fail par défaut. warn continue après les divergences prompt, baseline, tree et unrecorded, mais lève toujours une erreur quand un patch ne s’applique pas ou que le journal est épuisé. |

## Signature

```ts
export interface ReplayAgentOptions {
  readonly journal: readonly unknown[];
  readonly divergence?: ReplayDivergencePolicy;
}
```

## Contrats associés

- [ReplayDivergencePolicy](../replaydivergencepolicy/)
