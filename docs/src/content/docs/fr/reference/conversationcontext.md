---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                       | Présence  | Rôle                                                                                             |
| ------------ | ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------ |
| `repository` | `string`                                   | Requis    | Checkout Git hôte ciblé.                                                                         |
| `sandbox`    | `SandboxLease`                             | Requis    | Bail d’exécution utilisé pour transférer les transcripts vers ou depuis le home de l’agent.      |
| `staging`    | `string`                                   | Requis    | Dossier hôte recevant les transcripts capturés ou préparés.                                      |
| `home`       | `string \| undefined`                      | Optionnel | Home d’agent hôte utilisé pour localiser ou persister les transcripts natifs.                    |
| `local`      | `boolean \| undefined`                     | Optionnel | Utilise l’accès local hôte aux transcripts au lieu d’un transfert par le bail de sandbox.        |
| `warn`       | `((message: string) => void) \| undefined` | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations. |

## Signature

```ts
export interface ConversationContext {
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}
```

## Contrats associés

- [SandboxLease](../sandboxlease/)
