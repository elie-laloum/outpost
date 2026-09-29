---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

What a harness hook's run() returns for its phase: a decision, or undefined to change nothing. session-start: { instructions } adds instructions; before-tool: { deny } refuses the call with that reason, { input } replaces its input; after-tool: { result } replaces the tool result; stop: { continue } sends that text and keeps the loop running; before-model and after-model only observe. Any other shape fails with code configuration.

[Complete example and detailed rules](../../guide/harness-permissions/).

## Signature

```ts
export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;
```

## Related contracts

- [HarnessHookDecisions](../harnesshookdecisions/)
- [HarnessHookPhase](../harnesshookphase/)
