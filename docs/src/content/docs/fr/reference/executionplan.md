---
title: "ExecutionPlan"
description: "ExecutionPlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ExecutionPlan } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom            | Type                                                                                                                                   | Présence | Rôle                                                                                                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace`    | `{ readonly kind: "git" \| "directory" \| "ephemeral"; readonly binding?: FileWorkspaceBinding; }`                                     | Requis   | Type de workspace (git, directory ou ephemeral) et, pour un workspace de fichiers, le mode de liaison requis par sa source : copy, ephemeral, mount-readonly ou mount-write.                                           |
| `sandbox`      | `{ readonly provider: string; readonly placement: SandboxProvider["placement"]; readonly bindings: readonly FileWorkspaceBinding[]; }` | Requis   | Nom du fournisseur, emplacement (host, mounted ou remote) et modes de liaison des workspaces de fichiers pris en charge. Des options Git sans fournisseur décrivent le fournisseur Docker par défaut, sans mode listé. |
| `agents`       | `readonly { readonly name: string; readonly kind: Agent["kind"]; readonly fileWorkspaces?: AgentFeatures["fileWorkspaces"]; }[]`       | Requis   | Chaque agent qui s’exécuterait, candidats de repli compris, avec son nom, son type et, pour les agents CLI, les capacités de workspace de fichiers qu’il a déclarées.                                                  |
| `requirements` | `readonly ExecutionRequirement[]`                                                                                                      | Requis   | Ce dont l’exécution a besoin : le mode de liaison attendu de la sandbox, puis chaque capacité que chaque agent doit avoir démontrée. Vide pour un workspace Git.                                                       |
| `diagnostics`  | `readonly ExecutionDiagnostic[]`                                                                                                       | Requis   | Incompatibilités trouvées avant l’allocation, dans l’ordre où l’exécution les vérifie. Vide lorsque createSandbox() et dispatch() accepteraient ces options et ces réglages.                                           |

## Signature

```ts
export interface ExecutionPlan {
  readonly workspace: {
    readonly kind: "git" | "directory" | "ephemeral";
    readonly binding?: FileWorkspaceBinding;
  };
  readonly sandbox: {
    readonly provider: string;
    readonly placement: SandboxProvider["placement"];
    readonly bindings: readonly FileWorkspaceBinding[];
  };
  readonly agents: readonly {
    readonly name: string;
    readonly kind: Agent["kind"];
    readonly fileWorkspaces?: AgentFeatures["fileWorkspaces"];
  }[];
  readonly requirements: readonly ExecutionRequirement[];
  readonly diagnostics: readonly ExecutionDiagnostic[];
}
```

## Contrats associés

- [Agent](../type-agent/)
- [AgentFeatures](../support-agentfeatures/)
- [ExecutionDiagnostic](../executiondiagnostic/)
- [ExecutionRequirement](../executionrequirement/)
- [FileWorkspaceBinding](../support-fileworkspacebinding/)
- [SandboxProvider](../sandboxprovider/)
