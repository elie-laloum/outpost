---
title: "AgentProfileHooks"
description: "AgentProfileHooks — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProfileHooks } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom           | Type                                                        | Présence  | Rôle                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claude`      | `readonly NativeHook<"claude", string>[] \| undefined`      | Optionnel | Hooks Claude déclarés avec defineClaudeHook. Seul le harness CLI correspondant sélectionne cette liste figée ; son adaptateur valide les événements natifs à la composition.                               |
| `codex`       | `readonly NativeHook<"codex", string>[] \| undefined`       | Optionnel | Hooks Codex déclarés avec defineCodexHook. Seul le harness CLI correspondant sélectionne cette liste figée ; son adaptateur valide les événements natifs à la composition.                                 |
| `copilot`     | `readonly NativeHook<"copilot", string>[] \| undefined`     | Optionnel | Hooks Copilot déclarés avec defineCopilotHook. Seul le harness CLI correspondant sélectionne cette liste figée ; son adaptateur valide les événements natifs à la composition.                             |
| `kimi`        | `readonly NativeHook<"kimi", string>[] \| undefined`        | Optionnel | Hooks Kimi déclarés avec defineKimiHook. Seul le harness CLI correspondant sélectionne cette liste figée ; son adaptateur valide les événements natifs à la composition.                                   |
| `antigravity` | `readonly NativeHook<"antigravity", string>[] \| undefined` | Optionnel | Hooks Antigravity déclarés avec defineAntigravityHook. Seul le harness CLI correspondant sélectionne cette liste figée ; son adaptateur valide les événements natifs à la composition.                     |
| `outpost`     | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`     | Optionnel | Hooks de la boucle intégrée déclarés avec defineHarnessHook ; exécutés avant les hooks locaux de la même phase. Ils ne se propagent pas aux sous-agents, sauf si l’enfant utilise explicitement ce profil. |

## Signature

```ts
export interface AgentProfileHooks {
  readonly claude?: readonly NativeHook<"claude">[];
  readonly codex?: readonly NativeHook<"codex">[];
  readonly copilot?: readonly NativeHook<"copilot">[];
  readonly kimi?: readonly NativeHook<"kimi">[];
  readonly antigravity?: readonly NativeHook<"antigravity">[];
  readonly outpost?: readonly HarnessHook[];
}
```

## Contrats associés

- [HarnessHook](../harnesshook/)
- [NativeHook](../support-nativehook/)
