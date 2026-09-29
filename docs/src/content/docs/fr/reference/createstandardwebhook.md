---
title: "createStandardWebhook"
description: "createStandardWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createStandardWebhook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une source de déclencheur pour les émetteurs qui suivent le schéma Standard Webhooks. Elle vérifie chaque signature v1 de webhook-signature sur id.timestamp.body avec des secrets whsec_ dans une fenêtre d’horodatage, utilise webhook-id comme livraison et le champ type de la charge, ou webhook, comme kind. Elle ne renvoie pas d’acteur.

[Exemple complet et règles détaillées](../../guide/triggers/).

## Paramètres et propriétés

| Nom                   | Type                     | Présence  | Rôle                                                                                                                                                                                                                             |
| --------------------- | ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `StandardWebhookOptions` | Requis    | Secret de signature, fenêtre d’horodatage et nom de source.                                                                                                                                                                      |
| `options.secret`      | `TriggerSecret`          | Requis    | Secret whsec_ qui vérifie webhook-signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `options.toleranceMs` | `number \| undefined`    | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                       |
| `options.source`      | `string \| undefined`    | Optionnel | Nom indiqué dans TriggerEvent.source ; standard par défaut.                                                                                                                                                                      |

## Retour

`TriggerSource`

## Signature

```ts
export declare function createStandardWebhook(
  options: StandardWebhookOptions,
): TriggerSource;
```

## Contrats associés

- [StandardWebhookOptions](../standardwebhookoptions/)
- [TriggerSource](../triggersource/)
