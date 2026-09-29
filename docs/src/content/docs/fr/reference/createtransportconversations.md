---
title: "createTransportConversations"
description: "createTransportConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTransportConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un ConversationStore au format claude, codex, copilot, kimi ou harness avec snapshots de transport et espace de noms stable du projet. Le passer à l’option conversations du preset correspondant ou de createHarness() ; le store déclare son format, donc un harness incompatible échoue dès sa création. La capture préserve la relocalisation native, les transcripts enfants et les bundles de session ; locate matérialise un snapshot immuable sous le dossier de récupération du dépôt cible. Les chemins file restent lisibles et reference identifie l’index distant. Fichiers natifs et identifiants restent distincts ; les archives ne sont ni chiffrées ni authentifiées.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                           | Présence | Rôle                                                                                                                                                                                            |
| --------------------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`              | `StoredConversationFormat`     | Requis   | Format : claude ou codex pour le JSONL natif, copilot ou kimi pour les bundles de session, ou harness pour les transcriptions des harness personnalisés. Antigravity n’a pas de store portable. |
| `options`             | `TransportConversationOptions` | Requis   | Transport et espace de noms stable du projet, partagé par les exécuteurs restaurant ces conversations.                                                                                          |
| `options.namespace`   | `string`                       | Requis   | Espace de noms logique stable du projet, indépendant des chemins des checkouts. Utiliser des espaces distincts pour des projets différents.                                                     |
| `options.transporter` | `Transport`                    | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.                                                     |

## Retour

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  format: StoredConversationFormat,
  options: TransportConversationOptions,
): ConversationStore;
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [StoredConversationFormat](../storedconversationformat/)
- [TransportConversationOptions](../transportconversationoptions/)
