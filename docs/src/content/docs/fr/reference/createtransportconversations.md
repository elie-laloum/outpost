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

Enveloppe un ConversationStore de base, par exemple createKimiConversations() ou createHarnessConversations(), pour archiver ses captures en snapshots de transport sous un espace de noms stable du projet et le format du store de base. Le passer à l’option conversations du preset correspondant ou de createHarness() ; le store déclare le format de base, donc un harness incompatible échoue dès sa création. La capture préserve la relocalisation, les transcripts enfants et les bundles de session du store de base ; locate matérialise un snapshot immuable sous le dossier de récupération du dépôt cible. Les chemins file restent lisibles et reference identifie l’index distant. Fichiers natifs et identifiants restent distincts ; les archives ne sont ni chiffrées ni authentifiées.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Paramètres et propriétés

| Nom                   | Type                           | Présence | Rôle                                                                                                                                                                         |
| --------------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`                | `ConversationStore`            | Requis   | Store dont les captures sont archivées, par exemple createKimiConversations() ou createHarnessConversations() ; il doit déclarer un format, qui nomme les clés de transport. |
| `options`             | `TransportConversationOptions` | Requis   | Transport et espace de noms stable du projet, partagé par les exécuteurs restaurant ces conversations.                                                                       |
| `options.namespace`   | `string`                       | Requis   | Espace de noms logique stable du projet, indépendant des chemins des checkouts. Utiliser des espaces distincts pour des projets différents.                                  |
| `options.transporter` | `Transport`                    | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.                                  |

## Retour

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  base: ConversationStore,
  options: TransportConversationOptions,
): ConversationStore;
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
