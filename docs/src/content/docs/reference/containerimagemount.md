---
title: "ContainerImageMount"
description: "ContainerImageMount — Outpost API"
sidebar:
  order: 20
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerImageMount } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerImageMount } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name     | Type                  | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`  | `string`              | Required | Image reference the engine already has, such as registry.example.com/tools:1 or an image@sha256 digest. Outpost never pulls it: pull or load it on the engine host first, like the sandbox image. It follows the sandbox image rules (not empty, no leading -, no whitespace or control characters) and cannot contain commas or quotes, which the engines' --mount parsers treat as separators.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `path`   | `string \| undefined` | Optional | Absolute POSIX path inside the image to mount instead of the whole image, such as /usr/local/bin; / or no value mounts the whole image. It must be normalized, without ., .. or empty segments, a trailing slash, commas, quotes or control characters. Requires Docker Engine 28.0 or Podman 5.1 or later.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `target` | `string`              | Required | Absolute path in the sandbox, or a path starting with ~/ in the agent home. It cannot be or contain the workspace root, the agent home or /tmp, cannot lie inside the workspace root, where the engine would create the mountpoint in a host directory, and cannot overlap /outpost; in isolated mode it cannot overlap /tmp either. A relative target resolves inside the workspace root and is therefore refused. Prefer a direct child of the home such as ~/tools, or a path outside it such as /opt/tools: for a deeper home target the engine creates the missing folders owned by root, where the agent cannot write, and a single-file volume cannot sit under an image mount in the home. A mount nested under an image mount target needs its mountpoint to exist already in the read-only image. It cannot contain commas, quotes or control characters. |

## Signature

```ts
export interface ContainerImageMount {
  readonly image: string;
  readonly path?: string;
  readonly target: string;
}
```
