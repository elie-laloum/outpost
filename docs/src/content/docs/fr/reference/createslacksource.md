---
title: "createSlackSource"
description: "createSlackSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSlackSource } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une source de déclencheur Slack pour les commandes slash et les charges interactives. Elle vérifie X-Slack-Signature sur v0:timestamp:body dans une fenêtre d’horodatage, utilise trigger_id comme livraison, renvoie command ou le type d’interaction avec l’utilisateur sous la forme slack:<user id>, et répond 200 avec un corps vide. L’Events API n’est pas prise en charge.

[Exemple complet et règles détaillées](../../guide/triggers/).

## Paramètres et propriétés

| Nom                     | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                          |
| ----------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `SlackRequestOptions` | Requis    | Secret de signature de l’application Slack et fenêtre d’horodatage.                                                                                                                                                                                           |
| `options.signingSecret` | `TriggerSecret`       | Requis    | Secret de signature de l’application Slack qui vérifie X-Slack-Signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `options.toleranceMs`   | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                                                    |

## Retour

`TriggerSource`

## Signature

```ts
export declare function createSlackSource(
  options: SlackRequestOptions,
): TriggerSource;
```

## Contrats associés

- [SlackRequestOptions](../slackrequestoptions/)
- [TriggerSource](../triggersource/)
