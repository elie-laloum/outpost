---
title: "labelAdded"
description: "labelAdded — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { labelAdded } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie le dépôt, le numéro et la cible lorsque l’événement ajoute ce label à une issue ou une pull request GitHub, ou à une issue ou une merge request GitLab ; sinon undefined. Elle lit seulement la charge vérifiée et ne contrôle pas qui a ajouté le label.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

| Nom     | Type           | Présence | Rôle                                                       |
| ------- | -------------- | -------- | ---------------------------------------------------------- |
| `event` | `TriggerEvent` | Requis   | Événement vérifié provenant d’une source GitHub ou GitLab. |
| `label` | `string`       | Requis   | Nom exact du label qui doit venir d’être ajouté.           |

## Retour

`TriggerLabel | undefined`

## Signature

```ts
export declare function labelAdded(
  event: TriggerEvent,
  label: string,
): TriggerLabel | undefined;
```

## Contrats associés

- [TriggerEvent](../triggerevent/)
- [TriggerLabel](../triggerlabel/)
