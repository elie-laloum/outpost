---
title: "BuiltInAgentName"
description: "BuiltInAgentName — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Nom d’un agent CLI intégré enregistré dans le catalogue d’agents, dont dérivent les choix de outpost init et doctor, le bootstrap, les versions et la recette d’image. Valeurs : "claude" (Claude Code), "codex" (Codex), "antigravity" (Antigravity, agy), "copilot" (GitHub Copilot CLI), "kimi" (Kimi Code).

## Signature

```ts
export type BuiltInAgentName =
  "codex" | "claude" | "antigravity" | "copilot" | "kimi";
```
