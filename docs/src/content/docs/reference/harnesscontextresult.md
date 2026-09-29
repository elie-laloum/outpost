---
title: "HarnessContextResult"
description: "HarnessContextResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessContextResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

What a context strategy's compact() returns before each model request of the built-in harness: the messages that replace the history, or undefined to keep it unchanged. Replacement messages are validated and lose their reasoning blocks.

[Complete example and detailed rules](../../guide/harness-context/).

## Signature

```ts
export type HarnessContextResult = readonly ModelMessage[] | undefined;
```

## Related contracts

- [ModelMessage](../modelmessage/)
