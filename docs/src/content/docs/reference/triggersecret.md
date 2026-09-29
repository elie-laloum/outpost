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

## Purpose and behavior

Secret of createGithubWebhook(), createGitlabWebhook(), createSlackSource() and createStandardWebhook(): a string, or a callback returning every currently accepted secret so you can rotate without downtime. An empty string fails when the source is created; a callback that returns no usable secret fails verification.

[Complete example and detailed rules](../../guide/webhooks/).

## Signature

```ts
export type TriggerSecret =
  string | (() => readonly string[] | Promise<readonly string[]>);
```
