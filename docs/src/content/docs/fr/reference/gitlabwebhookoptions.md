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

| Nom            | Type                  | Présence          | Rôle                                                                                                                                                                                                                                                                                                                                 |
| -------------- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `signingToken` | `TriggerSecret`       | Selon la variante | Jeton de signature whsec_ du webhook GitLab (GitLab 19.0+) qui vérifie webhook-signature, ou callback renvoyant chaque jeton actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou vide, ou un jeton sans préfixe whsec_, refuse les requêtes. |
| `toleranceMs`  | `number \| undefined` | Selon la variante | Écart d’horloge accepté pour l’horodatage de la requête, en millisecondes ; 300000 (5 minutes) par défaut. Une valeur qui n’est pas un entier positif lève une erreur à la création.                                                                                                                                                 |
| `token`        | `TriggerSecret`       | Selon la variante | Jeton secret comparé en temps constant à X-Gitlab-Token, ou callback renvoyant chaque jeton actuellement accepté ; plus faible, car le corps n’est pas signé. Une chaîne vide lève une erreur à la création ; un callback en échec ou vide refuse les requêtes.                                                                      |

## Signature

```ts
export type GitlabWebhookOptions = GitlabSigningOptions | GitlabTokenOptions;
```

## Contrats associés

- [GitlabSigningOptions](../gitlabsigningoptions/)
- [GitlabTokenOptions](../gitlabtokenoptions/)
