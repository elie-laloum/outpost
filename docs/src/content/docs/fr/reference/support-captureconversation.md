---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Copie un transcript natif depuis le bail de sandbox vers le dossier de capture hôte et renvoie sa localisation lorsqu’il est disponible. La capture peut signaler des avertissements via options.warn ; elle n’exporte pas d’identifiants d’authentification.

## Paramètres et propriétés

| Nom             | Type                                       | Présence  | Rôle                                                                                                     |
| --------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `format`        | `ConversationFormat`                       | Requis    | Organisation native des transcripts : claude ou codex.                                                   |
| `id`            | `string`                                   | Requis    | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                      |
| `repository`    | `string`                                   | Requis    | Checkout Git hôte ciblé.                                                                                 |
| `lease`         | `SandboxLease`                             | Requis    | Bail d’exécution de sandbox utilisé pour accéder au home natif de l’agent et transférer les transcripts. |
| `staging`       | `string`                                   | Requis    | Dossier hôte servant à préparer les fichiers de transcript natif pendant le transfert.                   |
| `options`       | `CaptureOptions \| undefined`              | Optionnel | Home hôte des transcripts, mode d’accès local et callback d’avertissement non bloquant.                  |
| `options.home`  | `string \| undefined`                      | Optionnel | Home d’agent hôte utilisé pour localiser ou persister les transcripts natifs.                            |
| `options.warn`  | `((message: string) => void) \| undefined` | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations.         |
| `options.local` | `boolean \| undefined`                     | Optionnel | Utilise l’accès local hôte aux transcripts au lieu d’un transfert par le bail de sandbox.                |

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
