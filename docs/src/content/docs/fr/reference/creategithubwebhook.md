---
title: "createGithubWebhook"
description: "createGithubWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createGithubWebhook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une source de déclencheur GitHub. Elle vérifie X-Hub-Signature-256 avec chaque secret courant en temps constant, accepte les charges JSON et formulaire, et renvoie X-GitHub-Delivery, le nom X-GitHub-Event, l’action de la charge et l’émetteur sous la forme github:&lt;login>. Les signatures GitHub ne portent pas d’horodatage.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

| Nom              | Type                   | Présence | Rôle                                                                                                                                                                                                                                                                |
| ---------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `GithubWebhookOptions` | Requis   | Réglages du secret du webhook GitHub.                                                                                                                                                                                                                               |
| `options.secret` | `TriggerSecret`        | Requis   | Secret du webhook qui vérifie X-Hub-Signature-256, ou callback renvoyant chaque secret actuellement accepté (l’ancien et le nouveau pendant une rotation). Une chaîne vide lève une erreur à la création ; un callback en échec ou sans secret refuse les requêtes. |

## Retour

`TriggerSource`

## Signature

```ts
export declare function createGithubWebhook(
  options: GithubWebhookOptions,
): TriggerSource;
```

## Contrats associés

- [GithubWebhookOptions](../githubwebhookoptions/)
- [TriggerSource](../triggersource/)
