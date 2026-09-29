---
title: "BuiltInAgentName"
description: "BuiltInAgentName — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

Name of a built-in CLI agent registered in the agent catalog, from which outpost init and doctor choices, bootstrap, versions and the image recipe derive. Values: "claude" (Claude Code), "codex" (Codex), "antigravity" (Antigravity, agy), "copilot" (GitHub Copilot CLI), "kimi" (Kimi Code).

## Signature

```ts
export type BuiltInAgentName =
  "codex" | "claude" | "antigravity" | "copilot" | "kimi";
```
