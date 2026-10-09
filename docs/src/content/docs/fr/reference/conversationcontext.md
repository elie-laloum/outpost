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

| Nom                | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runtimeDirectory` | `string \| undefined`                      | Optionnel | Racine de contrôle des conversations de fichiers indépendante de la recherche de dépôt, conservant formats natifs et relocalisation.                                                                                                                           |
| `observation`      | `ObservationHub \| undefined`              | Optionnel | Scope d’observation portant la politique de masquage héritée pour les transcripts JSONL, fichiers annexes et bundles de session décodés avant archivage par transport.                                                                                         |
| `repository`       | `string`                                   | Requis    | Dépôt hôte de la tâche ; la capture réécrit les cwd enregistrés vers ce chemin.                                                                                                                                                                                |
| `sandbox`          | `SandboxLease`                             | Requis    | Bail d’exécution utilisé pour transférer les transcripts vers ou depuis le home de l’agent.                                                                                                                                                                    |
| `staging`          | `string`                                   | Requis    | Dossier hôte de travail pour les fichiers en transit ; les copies temporaires sont supprimées après chaque transfert.                                                                                                                                          |
| `home`             | `string \| undefined`                      | Optionnel | Racine sur l’hôte des conversations capturées, issue de l’option conversationHome. Par défaut, le home de l’utilisateur pour les stores de transcripts et le dépôt pour les stores de bundles de session.                                                      |
| `local`            | `boolean \| undefined`                     | Optionnel | Vaut true quand la sandbox s’exécute sur l’hôte. Les stores de transcripts lisent alors le transcript sur le disque au lieu de lancer find, et ignorent une restauration dans le checkout d’origine sauf si l’enregistrement porte une référence de transport. |
| `warn`             | `((message: string) => void) \| undefined` | Optionnel | Reçoit les avertissements non bloquants, par exemple un transcript enfant qui n’a pas pu être capturé.                                                                                                                                                         |

## Signature

```ts
export interface ConversationContext {
  readonly runtimeDirectory?: string;
  readonly observation?: ObservationHub;
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [SandboxLease](../sandboxlease/)
