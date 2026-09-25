---
title: "SandboxLease"
description: "SandboxLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxLease } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                                | Présence  | Rôle                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optionnel | Capacités optionnelles de manifeste et transfert par lot pour la synchronisation distante.                                 |
| `root`          | `string`                                                                            | Requis    | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                                 |
| `home`          | `string`                                                                            | Requis    | Chemin du home de l’agent à l’intérieur de l’environnement d’exécution.                                                    |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Requis    | Exécute une commande dans l’environnement loué et renvoie le statut réel du processus et ses flux capturés.                |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Transfère des fichiers ou le contenu de dossiers hôtes vers la sandbox en respectant annulation et délai.                  |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Transfère des fichiers ou le contenu de dossiers de sandbox vers l’hôte en préservant permissions et liens pris en charge. |
| `release`       | `() => Promise<void>`                                                               | Requis    | Libère l’environnement d’exécution alloué ; les appels répétés doivent être sans danger.                                   |

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
