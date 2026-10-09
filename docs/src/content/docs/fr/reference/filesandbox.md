---
title: "FileSandbox"
description: "FileSandbox — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandbox } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                         | Présence | Rôle                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Requis   | Inspecte le mode d’exécution sélectionné ; les probes Git s’exécutent seulement pour les workspaces Git.                        |
| `workspace`             | `FileWorkspace`                                                                              | Requis   | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.                                  |
| `root`                  | `string`                                                                                     | Requis   | Racine d’exécution dans la sandbox empruntée, distincte de son répertoire de contrôle hôte.                                     |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Requis   | Exécute la commande déclarée et conserve son véritable statut de sortie, son annulation et ses fichiers settled.                |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>`             | Requis   | Exécute un agent sur les fichiers actuels, en conservant le workspace entre réparations et passes de steering.                  |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>` | Requis   | Continue une conversation capturée dans le même workspace de fichiers conservé sans recopier les entrées initiales.             |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<FileDispatchResult<T>>` | Requis   | Bifurque une conversation capturée lorsque cela est pris en charge, en conservant les fichiers actuels du workspace.            |
| `attach`                | `(options?: AttachOptions) => Promise<FileAttachResult>`                                     | Requis   | Ouvre un terminal interactif seulement lorsque l’adapter prend explicitement en charge cette variante de workspace de fichiers. |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.                             |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.                             |

## Signature

```ts
export interface FileSandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: FileWorkspace;
  readonly root: string;
  command(command: Command): Promise<CommandResult>;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<FileAttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [AttachOptions](../attachoptions/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [DispatchOptions](../dispatchoptions/)
- [Disposal](../disposal/)
- [FileAttachResult](../fileattachresult/)
- [FileDispatchResult](../filedispatchresult/)
- [FileWorkspace](../fileworkspace/)
