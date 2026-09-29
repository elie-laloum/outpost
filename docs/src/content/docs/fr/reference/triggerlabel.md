---
title: "TriggerLabel"
description: "TriggerLabel — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerLabel } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                        | Présence | Rôle                                                                                                  |
| ------------ | --------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `source`     | `"github" \| "gitlab"`      | Requis   | Émetteur de l’événement : github ou gitlab.                                                           |
| `repository` | `string`                    | Requis   | owner/name sur GitHub, chemin du projet avec son espace de noms sur GitLab.                           |
| `number`     | `number`                    | Requis   | Numéro de l’issue ou de la pull request sur GitHub, IID de l’issue ou de la merge request sur GitLab. |
| `target`     | `"issue" \| "pull-request"` | Requis   | issue, ou pull-request pour une pull request GitHub ou une merge request GitLab.                      |
| `label`      | `string`                    | Requis   | Label ajouté.                                                                                         |

## Signature

```ts
export interface TriggerLabel {
  readonly source: "github" | "gitlab";
  /** `owner/name` on GitHub, `group/project` on GitLab. */
  readonly repository: string;
  /** Issue or pull request number; merge request IID on GitLab. */
  readonly number: number;
  readonly target: "issue" | "pull-request";
  readonly label: string;
}
```
