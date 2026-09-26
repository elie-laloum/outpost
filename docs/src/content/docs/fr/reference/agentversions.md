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

Expose les versions des CLI Claude Code, Codex, Copilot et Kimi épinglées pour les images générées et le bootstrap distant, qui servent de références aux fixtures de protocole intégrées. Antigravity n’y figure pas : son script d’installation officiel installe la version courante. Ces valeurs n’interrogent pas les binaires installés et ne prouvent pas l’accès à un compte.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom       | Type        | Présence | Rôle                                                                                     |
| --------- | ----------- | -------- | ---------------------------------------------------------------------------------------- |
| `codex`   | `"0.156.1"` | Requis   | Version du CLI Codex utilisée par les fixtures de compatibilité intégrées.               |
| `claude`  | `"2.1.280"` | Requis   | Version de Claude Code utilisée par les fixtures de compatibilité intégrées.             |
| `copilot` | `"1.0.88"`  | Requis   | Version de GitHub Copilot CLI installée par les images générées et le bootstrap distant. |
| `kimi`    | `"2.1.1"`   | Requis   | Version de la CLI Kimi Code installée par les images générées et le bootstrap distant.   |

## Signature

```ts
export declare const agentVersions: Readonly<{
  codex: "0.156.1";
  claude: "2.1.280";
  copilot: "1.0.88";
  kimi: "2.1.1";
}>;
```
