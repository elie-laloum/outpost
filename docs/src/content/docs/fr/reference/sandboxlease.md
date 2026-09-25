---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxLease**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom             | Type                                                                                | Présence  | Rôle                                                                             |
| --------------- | ----------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `root`          | `string`                                                                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `home`          | `string`                                                                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `release`       | `() => Promise<void>`                                                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SandboxLease {
  readonly fileTransfers?: FileTransfers;
  readonly root: string;
  readonly home: string;
  invoke(command: Command): Promise<CommandResult>;
  upload(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  download(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  release(): Promise<void>;
}
```

## Contrats associés

- [Command](../command/)
- [CommandResult](../commandresult/)
- [FileTransfers](../filetransfers/)
- [TransferOptions](../transferoptions/)
