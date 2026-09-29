---
title: "githubWebhook"
description: "githubWebhook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { githubWebhook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée une source de déclencheur GitHub. Elle vérifie X-Hub-Signature-256 avec chaque secret courant en temps constant, accepte les charges JSON et formulaire, et renvoie X-GitHub-Delivery, le nom X-GitHub-Event, l’action de la charge et l’émetteur sous la forme github:<login>. Les signatures GitHub ne portent pas d’horodatage.

[Exemple complet et règles détaillées](../../guide/triggers/).

## Paramètres et propriétés

| Nom              | Type                   | Présence | Rôle                                                                                                                                                                                                                                          |
| ---------------- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `GithubWebhookOptions` | Requis   | Réglages du secret du webhook GitHub.                                                                                                                                                                                                         |
| `options.secret` | `TriggerSecret`        | Requis   | Secret du webhook GitHub qui vérifie X-Hub-Signature-256. Secret, ou fonction renvoyant chaque secret actuellement accepté ; renvoyez l’ancienne et la nouvelle valeur pendant une rotation. Une source vide ou en échec refuse les requêtes. |

## Retour

`TriggerSource`

## Signature

```ts
export declare function githubWebhook(
  options: GithubWebhookOptions,
): TriggerSource;
```

## Contrats associés

- [GithubWebhookOptions](../githubwebhookoptions/)
- [TriggerSource](../triggersource/)
