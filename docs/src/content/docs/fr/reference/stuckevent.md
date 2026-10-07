---
title: "StuckEvent"
description: "StuckEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StuckEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                          | Présence  | Rôle                                                                                                                    |
| ---------- | ----------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `kind`     | `"stuck"`                     | Requis    | Toujours stuck : Outpost a détecté une activité décodée répétitive.                                                     |
| `activity` | `"tool" \| "file-change"`     | Requis    | Catégorie d’événement décodé répétitif : tool ou file-change.                                                           |
| `name`     | `string \| undefined`         | Optionnel | Nom de l’outil si activity vaut tool ; absent pour file-change. Les entrées et contenus de fichiers ne sont pas inclus. |
| `repeats`  | `number`                      | Requis    | Occurrences de l’activité identique quand le seuil configuré a été atteint.                                             |
| `window`   | `number`                      | Requis    | Nombre maximal configuré d’événements d’activité décodés dans la fenêtre glissante.                                     |
| `action`   | `"stop" \| "warn" \| "steer"` | Requis    | Action de la politique sélectionnée : stop, warn ou steer. Un nombre d’interventions épuisé sélectionne stop.           |

## Signature

```ts
export interface StuckEvent {
  readonly kind: "stuck";
  readonly activity: "tool" | "file-change";
  readonly name?: string;
  readonly repeats: number;
  readonly window: number;
  readonly action: "stop" | "warn" | "steer";
}
```
