---
title: "createFallbackAgent"
description: "createFallbackAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createFallbackAgent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ordonne au moins deux agents en un FallbackAgent figé que le dispatch exécute dans une seule sandbox et un seul workspace, sans réinitialisation. Un candidat ne passe la main que sur une faute de quota ou de panne listée dans on, et le suivant repart du brief d’origine ; tout autre échec est relancé. Moins de deux candidats, un agent de secours imbriqué ou une liste on invalide lèvent le code configuration.

[Exemple complet et règles détaillées](../../guide/fallback-agents/).

## Paramètres et propriétés

| Nom          | Type                                  | Présence | Rôle                                                                                                                                                                       |
| ------------ | ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agents`     | `readonly [Agent, Agent, ...Agent[]]` | Requis   | Candidats ordonnés, au moins deux, chacun composé avec createAgent() ou createReplayAgent() ; le premier est essayé en premier.                                            |
| `options`    | `FallbackAgentOptions`                | Requis   | Politique de repli : la liste on des catégories d’échec.                                                                                                                   |
| `options.on` | `readonly FallbackTrigger[]`          | Requis   | Catégories d’échec qui font passer au candidat suivant : quota, unavailable ou les deux. Une liste vide, une répétition ou une valeur inconnue lève le code configuration. |

## Retour

`FallbackAgent`

## Signature

```ts
export declare function createFallbackAgent(
  agents: readonly [Agent, Agent, ...Agent[]],
  options: FallbackAgentOptions,
): FallbackAgent;
```

## Contrats associés

- [Agent](../type-agent/)
- [FallbackAgent](../type-fallbackagent/)
- [FallbackAgentOptions](../fallbackagentoptions/)
