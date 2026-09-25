---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationContext**. Consultez le [guide conversations](../../guide/agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ConversationContext } from "@elie-laloum/outpost";
```

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom          | Type                                       | Présence  | Rôle                                                                             |
| ------------ | ------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `repository` | `string`                                   | Requis    | Checkout Git hôte ciblé.                                                         |
| `sandbox`    | `SandboxLease`                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `staging`    | `string`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `home`       | `string \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `local`      | `boolean \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `warn`       | `((message: string) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
