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

## Parameters and properties

| Name           | Type                                                                                                                                   | Presence | Meaning                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspace`    | `{ readonly kind: "git" \| "directory" \| "ephemeral"; readonly binding?: FileWorkspaceBinding; }`                                     | Required | Workspace kind (git, directory or ephemeral) and, for file workspaces, the binding its source needs: copy, ephemeral, mount-readonly or mount-write.                                                   |
| `sandbox`      | `{ readonly provider: string; readonly placement: SandboxProvider["placement"]; readonly bindings: readonly FileWorkspaceBinding[]; }` | Required | Provider name, placement (host, mounted or remote) and the file workspace bindings the provider supports. Git options without a provider describe the default Docker provider with no bindings listed. |
| `agents`       | `readonly { readonly name: string; readonly kind: Agent["kind"]; readonly fileWorkspaces?: AgentFeatures["fileWorkspaces"]; }[]`       | Required | Each agent that would run, fallback candidates included, with its name, kind and, for CLI agents, the file workspace features it has declared.                                                         |
| `requirements` | `readonly ExecutionRequirement[]`                                                                                                      | Required | What the execution needs: the workspace binding from the sandbox, then each capability every agent must have demonstrated. Empty for Git workspaces.                                                   |
| `diagnostics`  | `readonly ExecutionDiagnostic[]`                                                                                                       | Required | Incompatibilities found before allocation, in the order execution checks them. Empty when createSandbox() and dispatch() would accept these options and settings.                                      |

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

## Related contracts

- [Agent](../type-agent/)
- [AgentFeatures](../support-agentfeatures/)
- [ExecutionDiagnostic](../executiondiagnostic/)
- [ExecutionRequirement](../executionrequirement/)
- [FileWorkspaceBinding](../support-fileworkspacebinding/)
- [SandboxProvider](../sandboxprovider/)
