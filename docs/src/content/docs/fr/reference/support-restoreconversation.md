---
title: "restoreConversation"
description: "restoreConversation — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom        | Type                   | Présence | Rôle                                                                             |
| ---------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `location` | `ConversationLocation` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `lease`    | `SandboxLease`         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `staging`  | `string`               | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function restoreConversation(
  location: ConversationLocation,
  lease: SandboxLease,
  staging: string,
): Promise<void>;
```

## Contrats associés

- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
