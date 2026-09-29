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

Compose un FallbackAgent ordonné à partir d’au moins deux agents et d’une liste on explicite. Le dispatch exécute les candidats dans l’ordre dans le même sandbox et le même workspace, en préparant chacun seulement lorsqu’il est essayé, et ne passe au suivant qu’après un échec quota ou unavailable listé dans on ; les autres échecs sont relancés. La construction valide et fige la liste sans rien démarrer.

[Exemple complet et règles détaillées](../../guide/fallback-agents/).

## Paramètres et propriétés

| Nom          | Type                                  | Présence | Rôle                                                                                                                            |
| ------------ | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `agents`     | `readonly [Agent, Agent, ...Agent[]]` | Requis   | Candidats ordonnés, au moins deux, chacun composé avec createAgent() ou createReplayAgent() ; le premier est essayé en premier. |
| `options`    | `FallbackAgentOptions`                | Requis   | Politique de repli ; on est obligatoire.                                                                                        |
| `options.on` | `readonly FallbackTrigger[]`          | Requis   | Catégories d’échec qui font passer au candidat suivant : quota, unavailable ou les deux, sans répétition.                       |

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
