---
title: "TriggerSecret"
description: "TriggerSecret — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TriggerSecret } from "@elie-laloum/outpost";
```

## Rôle et comportement

Secret de createGithubWebhook(), createGitlabWebhook(), createSlackSource() et createStandardWebhook() : une chaîne, ou un callback qui renvoie tous les secrets acceptés à cet instant pour permettre une rotation sans interruption. Une chaîne vide échoue à la création de la source ; un callback qui ne renvoie aucun secret utilisable fait échouer la vérification.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Signature

```ts
export type TriggerSecret =
  string | (() => readonly string[] | Promise<readonly string[]>);
```
