---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom             | Type                                       | Présence  | Rôle                                                                                          |
| --------------- | ------------------------------------------ | --------- | --------------------------------------------------------------------------------------------- |
| `format`        | `ConversationFormat`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `id`            | `string`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `repository`    | `string`                                   | Requis    | Checkout Git hôte ciblé.                                                                      |
| `lease`         | `SandboxLease`                             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `staging`       | `string`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options`       | `CaptureOptions \| undefined`              | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.home`  | `string \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.warn`  | `((message: string) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.local` | `boolean \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<ConversationLocation>`

## Signature

```ts
export declare function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options?: CaptureOptions,
): Promise<ConversationLocation>;
```

## Contrats associés

- [CaptureOptions](../support-captureoptions/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
