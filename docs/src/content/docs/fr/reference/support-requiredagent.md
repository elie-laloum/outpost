---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom     | Type           | Présence | Rôle                              |
| ------- | -------------- | -------- | --------------------------------- |
| `agent` | `AgentAdapter` | Requis   | Adapter natif de l’agent de code. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: AgentAdapter;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
