---
title: "GitlabWebhookOptions"
description: "GitlabWebhookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { GitlabWebhookOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom            | Type                  | Présence          | Rôle                                                                                                                                                                                                                                                                           |
| -------------- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signingToken` | `TriggerSecret`       | Selon la variante | Jeton de signature whsec_ du webhook GitLab (GitLab 19.0+), qui vérifie webhook-signature. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |
| `toleranceMs`  | `number \| undefined` | Selon la variante | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut.                                                                                                                                                                     |
| `token`        | `TriggerSecret`       | Selon la variante | Jeton secret comparé à X-Gitlab-Token ; plus faible car le corps n’est pas signé. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes.          |

## Signature

```ts
export type GitlabWebhookOptions = GitlabSigningOptions | GitlabTokenOptions;
```

## Contrats associés

- [GitlabSigningOptions](../gitlabsigningoptions/)
- [GitlabTokenOptions](../gitlabtokenoptions/)
