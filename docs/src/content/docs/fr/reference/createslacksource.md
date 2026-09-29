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

Crée une source de déclencheur Slack pour les commandes slash et les charges interactives. Elle vérifie X-Slack-Signature sur v0:timestamp:body dans une fenêtre d’horodatage et utilise trigger_id comme livraison, en refusant les requêtes qui n’en ont pas ; kind vaut command ou le type d’interaction, et actor vaut slack:&lt;user id>. Elle répond 200 avec un corps vide ; l’Events API n’est pas prise en charge.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

| Nom                     | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                |
| ----------------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `SlackRequestOptions` | Requis    | Secret de signature de l’application Slack et fenêtre d’horodatage.                                                                                                                                                                                                                 |
| `options.signingSecret` | `TriggerSecret`       | Requis    | Secret de signature de l’application Slack qui vérifie X-Slack-Signature, ou callback renvoyant chaque secret actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou vide refuse les requêtes. |
| `options.toleranceMs`   | `number \| undefined` | Optionnel | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut. Une valeur qui n’est pas un entier positif lève une erreur à la création.                                                                                                |

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
