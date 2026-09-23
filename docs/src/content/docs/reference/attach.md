---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 10
---

Public contract for **attach**. See the [commands and terminal guide](../../sandboxes/commands/) for behavior, defaults and examples.

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
```

## Related contracts

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
