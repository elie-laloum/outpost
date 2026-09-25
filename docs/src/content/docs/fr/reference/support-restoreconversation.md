---
title: "restoreConversation"
description: "restoreConversation — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Envoie un transcript natif précédemment localisé dans le home de l’agent en sandbox, en réécrivant les chemins de l’ancien checkout vers le workspace courant avant la continuation.

## Paramètres et propriétés

| Nom        | Type                   | Présence | Rôle                                                                                                     |
| ---------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `location` | `ConversationLocation` | Requis   | Identité, format et chemin hôte du transcript existant à restaurer.                                      |
| `lease`    | `SandboxLease`         | Requis   | Bail d’exécution de sandbox utilisé pour accéder au home natif de l’agent et transférer les transcripts. |
| `staging`  | `string`               | Requis   | Dossier hôte servant à préparer les fichiers de transcript natif pendant le transfert.                   |

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
