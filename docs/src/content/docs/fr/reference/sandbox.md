---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                         | Présence | Rôle                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Requis   | Sonde commandes, agent et transferts optionnels de cette sandbox sous son verrou d’opération exclusif.                 |
| `workspace`             | `Workspace`                                                                                  | Requis   | Workspace lié à cette sandbox ; sa possession détermine si fermer la sandbox le ferme aussi.                           |
| `root`                  | `string`                                                                                     | Requis   | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                             |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Requis   | Exécute un brief d’agent sur le bail existant de cette sandbox et renvoie un résultat chaud.                           |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Poursuit l’identifiant de conversation native donné sur le bail existant de cette sandbox.                             |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Bifurque depuis l’identifiant de conversation native donné et exécute un nouveau brief sur le bail de cette sandbox.   |
| `attach`                | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Requis   | Attache le terminal interactif réel d’un agent à l’environnement existant de cette sandbox.                            |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Requis   | Exécute une commande sur ce bail ; renvoie les statuts non nuls sans les convertir en échecs de tâche de workflow.     |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Requis   | Attend les opérations possédées et libère la sandbox ; ne ferme le workspace que si cette sandbox en est propriétaire. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Requis   | Ferme cette ressource via le mécanisme de libération asynchrone JavaScript.                                            |

## Signature

```ts
export interface Sandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<AttachResult>;
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [DispatchOptions](../dispatchoptions/)
- [Disposal](../disposal/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [WarmDispatchResult](../warmdispatchresult/)
- [Workspace](../workspace/)
