---
title: "createGitlabWebhook"
description: "createGitlabWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGitlabWebhook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une source de déclencheur GitLab. Avec signingToken, elle vérifie l’en-tête webhook-signature d’un jeton de signature whsec_ (GitLab 19.0+) dans une fenêtre d’horodatage et utilise webhook-id ; avec token, elle compare X-Gitlab-Token et utilise Idempotency-Key ou X-Gitlab-Event-UUID. Elle renvoie object_kind, l’action de l’objet et l’utilisateur sous la forme gitlab:<username>.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                    | Type                   | Présence          | Rôle                                                                                                                                                                                                                                                                           |
| ---------------------- | ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`              | `GitlabWebhookOptions` | Requis            | Soit signingToken (recommandé, signe le corps), soit token (en-tête historique en clair), pas les deux.                                                                                                                                                                        |
| `options.signingToken` | `TriggerSecret`        | Selon la variante | Jeton de signature whsec_ du webhook GitLab (GitLab 19.0+), qui vérifie webhook-signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `options.toleranceMs`  | `number \| undefined`  | Selon la variante | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                                                                     |
| `options.token`        | `TriggerSecret`        | Selon la variante | Jeton secret comparé à X-Gitlab-Token ; plus faible car le corps n’est pas signé. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes.          |

## Retour

`TriggerSource`

## Signature

```ts
export declare function createGitlabWebhook(
  options: GitlabWebhookOptions,
): TriggerSource;
```

## Contrats associés

- [GitlabWebhookOptions](../gitlabwebhookoptions/)
- [TriggerSource](../triggersource/)
