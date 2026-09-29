---
title: "HarnessInstructionContext"
description: "HarnessInstructionContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessInstructionContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                             | Présence  | Rôle                                                                                                                                                     |
| --------- | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease`                   | Requis    | Sandbox empruntée du tour, par exemple pour lire les consignes du projet avant la première requête.                                                      |
| `signal`  | `AbortSignal`                    | Requis    | Signal d’annulation du tour ; respectez-le dans les résolveurs asynchrones.                                                                              |
| `model`   | `AgentModel`                     | Requis    | Modèle normalisé de l’agent qui exécute le tour.                                                                                                         |
| `mcp`     | `HarnessMcpContext \| undefined` | Optionnel | Accès aux serveurs MCP démarrés pour ce tour, présent quand le harness déclare mcpServers. Les résolveurs d’instructions des skills ne le reçoivent pas. |

## Signature

```ts
export interface HarnessInstructionContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly mcp?: HarnessMcpContext;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [HarnessMcpContext](../harnessmcpcontext/)
- [SandboxLease](../sandboxlease/)
