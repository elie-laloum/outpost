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

| Nom       | Type                             | Présence  | Rôle                                                                                                   |
| --------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `sandbox` | `SandboxLease`                   | Requis    | Sandbox emprunté de la passe, par exemple pour lire les consignes du projet avant la première requête. |
| `signal`  | `AbortSignal`                    | Requis    | Signal d’annulation de la passe ; respectez-le dans les résolveurs asynchrones.                        |
| `model`   | `AgentModel`                     | Requis    | Modèle normalisé de l’agent qui exécute la passe.                                                      |
| `mcp`     | `HarnessMcpContext \| undefined` | Optionnel | Accès aux serveurs MCP démarrés pour ce tour, présent lorsque le harness déclare mcpServers.           |

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
