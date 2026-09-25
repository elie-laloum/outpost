---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Sandbox**. Consultez le [guide sandboxes](../../guide/environment/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

## Rôle et comportement

Acquérir un environnement d’exécution et le réutiliser pour des commandes ou tâches d’agent séquentielles.

Docker est le provider par défaut. Une seule opération peut posséder une sandbox à la fois. La fermeture est idempotente ; annuler une commande ne détruit pas à elle seule une sandbox chaude.

[Exemple complet et règles détaillées](../../guide/environment/lifecycle/).

## Paramètres et propriétés

| Nom         | Type                                                                                         | Présence | Rôle                                                                               |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `diagnose`  | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `workspace` | `Workspace`                                                                                  | Requis   | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche. |
| `root`      | `string`                                                                                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `dispatch`  | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `resume`    | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `fork`      | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `attach`    | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `command`   | `(command: Command) => Promise<CommandResult>`                                               | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `close`     | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |

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
