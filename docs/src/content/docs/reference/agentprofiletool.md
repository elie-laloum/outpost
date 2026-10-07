---
title: "AgentProfileTool"
description: "AgentProfileTool — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentProfileTool } from "@elie-laloum/outpost";
```

## Purpose and behavior

Portable built-in tool capability: read, edit, unrestricted shell, or shell:&lt;exact command>. Exact commands compare the entire string, including whitespace and shell syntax; no wildcard or prefix expansion occurs.

[Complete example and detailed rules](../../guide/choose-an-agent/).

## Signature

```ts
export type AgentProfileTool = "read" | "edit" | "shell" | `shell:${string}`;
```
