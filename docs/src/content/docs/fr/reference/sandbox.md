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

| Nom                     | Type                                                                                         | Présence | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Requis   | Sonde node, git et l’exécution de commandes dans cette sandbox, ainsi qu’un CLI d’agent et les transferts de fichiers sur demande. Se résout avec un rapport dont hasFailures signale les vérifications échouées ; n’installe jamais l’agent.                                                                                                                                                                                                                            |
| `workspace`             | `Workspace`                                                                                  | Requis   | Workspace dans lequel travaille cette sandbox. close() ne le ferme aussi que si createSandbox() l’a ouvert ; fermez un workspace fourni après la sandbox.                                                                                                                                                                                                                                                                                                                |
| `root`                  | `string`                                                                                     | Requis   | Chemin du dépôt dans la sandbox ; les commandes sans directory s’y exécutent.                                                                                                                                                                                                                                                                                                                                                                                            |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Requis   | Exécute un brief dans une nouvelle conversation sur cette sandbox et se résout avec un résultat chaud dont resume() et fork() restent ici. La branche n’est pas intégrée et la sandbox reste ouverte, y compris en cas d’échec, où le recovery de l’erreur indique la branche et le répertoire. Les hooks de préparation conditionnels sont vérifiés d’abord ; leur échec bloque l’exécution et laisse la sandbox ouverte pour réessayer.                                |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Poursuit la conversation native de cet identifiant sur cette sandbox, en la restaurant d’abord si elle a été capturée ailleurs. L’agent doit savoir reprendre une conversation.                                                                                                                                                                                                                                                                                          |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Requis   | Poursuit une copie de la conversation native de cet identifiant sur cette sandbox, sans modifier l’originale. L’agent doit prendre en charge le fork automatisé.                                                                                                                                                                                                                                                                                                         |
| `attach`                | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Requis   | Lance le CLI de l’agent dans votre terminal, à l’intérieur de cette sandbox, avec un brief ou une continuation facultatifs, et se résout à votre sortie avec son statut et ses commits. Exige un agent CLI unique ; la session est arrêtée après 86400000 (24 heures). Les hooks de préparation conditionnels sont vérifiés d’abord ; leur échec bloque l’exécution et laisse la sandbox ouverte pour réessayer.                                                         |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Requis   | Exécute un programme dans cette sandbox et se résout avec son statut et sa sortie, même pour un statut non nul ; rejette à l’échéance de son délai, à l’annulation de son signal ou à la fermeture de la sandbox. Sur un provider distant, les modifications de la sandbox sont ensuite rapatriées dans le worktree de l’hôte. Les hooks de préparation conditionnels sont vérifiés d’abord ; leur échec bloque l’exécution et laisse la sandbox ouverte pour réessayer. |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Requis   | Interrompt l’opération en cours, libère l’environnement et, si createSandbox() a ouvert le workspace, le ferme ; se résout avec retainedDirectory quand le worktree est conservé. preserve: true conserve le worktree ; les appels suivants renvoient la promesse du premier.                                                                                                                                                                                            |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Requis   | Appelle close() sans options, pour que await using ferme la sandbox à la fin de son bloc.                                                                                                                                                                                                                                                                                                                                                                                |

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
