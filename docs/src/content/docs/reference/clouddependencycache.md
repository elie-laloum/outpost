---
title: "CloudDependencyCache"
description: "CloudDependencyCache — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CloudDependencyCache } from "@elie-laloum/outpost/providers/vercel";
import type { CloudDependencyCache } from "@elie-laloum/outpost/providers/daytona";
```

## Parameters and properties

| Name        | Type        | Presence | Meaning                                                                                                                                                                                                                                                                |
| ----------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transport` | `Transport` | Required | Caller-owned Transport used on the host to restore before sandboxReady and archive before release. Credentials stay on the host. Conditional publication keeps a concurrent newer snapshot; other storage failures propagate while sandbox cleanup is still attempted. |
| `name`      | `string`    | Required | Cache name and directory under /outpost/cache: up to 48 lowercase letters, digits or hyphens, starting with a letter, unique per provider.                                                                                                                             |
| `key`       | `string`    | Required | Compatibility key of 1 to 1024 characters. Changing it selects a new archive; repository, provider environment and sandbox UID/GID also participate in identity.                                                                                                       |

## Signature

```ts
export interface CloudDependencyCache extends DependencyCache {
  readonly transport: Transport;
}
```

## Related contracts

- [DependencyCache](../dependencycache/)
- [Transport](../transport/)
