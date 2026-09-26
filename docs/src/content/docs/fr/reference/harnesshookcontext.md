---
title: "HarnessHookContext"
description: "HarnessHookContext — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessHookContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                       |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------ |
| `sandbox` | `SandboxLease` | Requis   | Sandbox emprunté de la passe ; les hooks peuvent inspecter le dépôt par son intermédiaire. |
| `signal`  | `AbortSignal`  | Requis   | Signal d’annulation de la passe ; les hooks asynchrones doivent le respecter.              |
| `model`   | `AgentModel`   | Requis   | Modèle normalisé de l’agent qui exécute la passe.                                          |
| `step`    | `number`       | Requis   | Numéro de l’étape en cours ; 0 pendant session-start.                                      |

## Signature

```ts
export interface HarnessHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly step: number;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [SandboxLease](../sandboxlease/)
