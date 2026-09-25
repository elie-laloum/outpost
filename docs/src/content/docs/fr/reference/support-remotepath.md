---
title: "remotePath"
description: "remotePath — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Calcule le chemin du transcript natif à l’intérieur d’un bail de sandbox à partir du format et de l’identifiant de conversation, en utilisant son home et son chemin de workspace.

## Paramètres et propriétés

| Nom        | Type                 | Présence | Rôle                                                                                                     |
| ---------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `format`   | `ConversationFormat` | Requis   | Organisation native des transcripts : claude ou codex.                                                   |
| `id`       | `string`             | Requis   | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                      |
| `lease`    | `SandboxLease`       | Requis   | Bail d’exécution de sandbox utilisé pour accéder au home natif de l’agent et transférer les transcripts. |
| `original` | `string`             | Requis   | Nom d’origine du fichier de transcript natif lorsque nécessaire pour conserver le nom de session Codex.  |

## Retour

`string`

## Signature

```ts
export declare function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [SandboxLease](../sandboxlease/)
