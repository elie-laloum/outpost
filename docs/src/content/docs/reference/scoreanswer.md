---
title: "ScoreAnswer"
description: "ScoreAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScoreAnswer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                            | Presence | Meaning                                                                                                                                                                           |
| --------------- | ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `"score"`                                       | Required | Answer discriminator score.                                                                                                                                                       |
| `score`         | `number`                                        | Required | Native probability-weighted level index, between zero and the number of levels minus one; consistency allows accumulated four-decimal rounding of the score and probabilities.    |
| `probabilities` | `Readonly<Record<string, number>>`              | Required | Native distribution keyed by level indices; omitted zero-probability levels and accumulated four-decimal rounding error are allowed. Values are retained without renormalization. |
| `confidence`    | `number`                                        | Required | Native confidence in [0,1], retained without recomputing it from the distribution.                                                                                                |
| `legend`        | `Readonly<Record<string, string>> \| undefined` | Optional | Optional native mapping from all level positions to textual descriptions.                                                                                                         |

## Signature

```ts
export interface ScoreAnswer {
  readonly type: "score";
  readonly score: number;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly confidence: number;
  readonly legend?: Readonly<Record<string, string>>;
}
```
