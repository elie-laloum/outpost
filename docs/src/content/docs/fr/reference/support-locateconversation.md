---
title: "locateConversation"
description: "locateConversation — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Localise un transcript natif existant selon son format, son identifiant et son dépôt dans le home hôte choisi. Renvoie son identité et son chemin, et échoue si aucun transcript correspondant n’est trouvé.

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                |
| ------------ | --------------------- | --------- | ----------------------------------------------------------------------------------- |
| `format`     | `ConversationFormat`  | Requis    | Organisation native des transcripts : claude ou codex.                              |
| `id`         | `string`              | Requis    | Identifiant de conversation native utilisé pour localiser ou poursuivre la session. |
| `repository` | `string`              | Requis    | Checkout Git hôte ciblé.                                                            |
| `home`       | `string \| undefined` | Optionnel | Home d’agent hôte utilisé pour localiser ou persister les transcripts natifs.       |

## Retour

`Promise<ConversationLocation>`

## Signature

```ts
export declare function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home?: string,
): Promise<ConversationLocation>;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
