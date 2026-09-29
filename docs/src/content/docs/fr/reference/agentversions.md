---
title: "agentVersions"
description: "agentVersions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { agentVersions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Version épinglée de la CLI de chaque agent intégré, indexée par nom d’agent. Les images générées et le bootstrap distant installent ces versions, et doctor les affiche comme référence ; les lire n’interroge pas les binaires installés.

[Exemple complet et règles détaillées](../../guide/agent-images/).

## Paramètres et propriétés

| Nom           | Type     | Présence | Rôle                                                                                                                                                                                         |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex`       | `string` | Requis   | Version de la CLI Codex installée par les images générées et le bootstrap distant.                                                                                                           |
| `claude`      | `string` | Requis   | Version de Claude Code installée par les images générées et le bootstrap distant.                                                                                                            |
| `antigravity` | `string` | Requis   | Version de la CLI Antigravity installée depuis des archives vérifiées par SHA-512 dans les images générées et le bootstrap distant, et utilisée comme référence de compatibilité par doctor. |
| `copilot`     | `string` | Requis   | Version de GitHub Copilot CLI installée par les images générées et le bootstrap distant.                                                                                                     |
| `kimi`        | `string` | Requis   | Version de la CLI Kimi Code installée par les images générées et le bootstrap distant.                                                                                                       |

## Signature

```ts
export declare const agentVersions: Readonly<Record<BuiltInAgentName, string>>;
```
