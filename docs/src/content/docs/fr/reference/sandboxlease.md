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

| Nom             | Type                                                                                | Présence  | Rôle                                                                                                                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileTransfers` | `FileTransfers \| undefined`                                                        | Optionnel | Capacités de manifeste et de lot pour la synchronisation distante : Outpost ne télécharge que les fichiers modifiés et vérifie leur SHA-256. Sans elles, les fichiers passent un par un par upload() et download() ; Vercel et Daytona les fournissent.                       |
| `liveInput`     | `boolean \| undefined`                                                              | Optionnel | Vrai quand invoke() transmet Command.input au processus en cours. Le steering d’un CLI n’atteint un tour en cours que sur un tel bail, sinon Outpost arrête puis reprend l’agent ; les serveurs MCP du harness intégré l’exigent. Tous les providers intégrés le définissent. |
| `root`          | `string`                                                                            | Requis    | Répertoire du dépôt dans la sandbox ; les commandes s’y exécutent quand Command.directory est absent.                                                                                                                                                                         |
| `home`          | `string`                                                                            | Requis    | Home de l’agent dans la sandbox, où Outpost installe identifiants, réglages du CLI et conversations natives. Le provider local utilise votre home hôte.                                                                                                                       |
| `invoke`        | `(command: Command) => Promise<CommandResult>`                                      | Requis    | Exécute une commande dans la sandbox et se résout à la fin du processus, avec son statut réel, même non nul, et la fin conservée de stdout et stderr. signal et deadlineMs arrêtent le processus et ses descendants sans fermer la sandbox.                                   |
| `upload`        | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Transfère des fichiers ou le contenu de dossiers hôtes vers la sandbox en respectant annulation et délai.                                                                                                                                                                     |
| `download`      | `(source: string, destination: string, options?: TransferOptions) => Promise<void>` | Requis    | Transfère des fichiers ou le contenu de dossiers de sandbox vers l’hôte en préservant permissions et liens pris en charge.                                                                                                                                                    |
| `release`       | `() => Promise<void>`                                                               | Requis    | Détruit l’environnement et arrête ses commandes en cours. Outpost l’appelle à la fermeture de la sandbox ; un second appel doit se résoudre sans erreur.                                                                                                                      |

## Signature

```ts
export interface SandboxLease {
  readonly fileTransfers?: FileTransfers;
  /** Whether invoke accepts Command.input as live stdin for a running process. */
  readonly liveInput?: boolean;
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
