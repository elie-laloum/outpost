---
title: "ContainerLabels"
description: "ContainerLabels — Outpost API"
sidebar:
  order: 10
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerLabels } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerLabels } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Container labels as key-value strings: ContainerOptions.labels at creation, the ContainerSandboxQuery.labels selector and the labels reported in ContainerSandbox. In the labels Outpost sets or selects, keys start with a letter or digit and contain only letters, digits, ., _, / and - (255 characters at most); the io.outpost. prefix is reserved for Outpost. Values are non-empty strings of at most 1024 characters, without control characters or surrounding whitespace.

[Complete example and detailed rules](../../guide/containers/).

## Signature

```ts
export type ContainerLabels = Readonly<Record<string, string>>;
```
