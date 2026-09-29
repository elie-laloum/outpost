---
title: "Channel"
description: "Channel — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Channel } from "@elie-laloum/outpost";
```

## Purpose and behavior

Output stream a command line came from, passed to Command.observe(). Values: "stdout" (standard output), "stderr" (standard error).

[Complete example and detailed rules](../../guide/sandbox-sessions/).

## Signature

```ts
export type Channel = "stdout" | "stderr";
```
