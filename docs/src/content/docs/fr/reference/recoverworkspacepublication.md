---
title: "recoverWorkspacePublication"
description: "recoverWorkspacePublication — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverWorkspacePublication } from "@elie-laloum/outpost";
```

## Rôle et comportement

Termine ou annule explicitement une publication inspectée, en écartant les writers périmés et en conservant les changements concurrents. Ne rejoue jamais les tâches terminées.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom                        | Type                                      | Présence  | Rôle                                                                                                                                   |
| -------------------------- | ----------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter`              | `Transport`                               | Requis    | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.                       |
| `reference`                | `TransportReference`                      | Requis    | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés.                   |
| `action`                   | `"finish" \| "rollback"`                  | Requis    | Demande explicite finish ou rollback ; toutes deux vérifient les préconditions actuelles et n’exécutent jamais les tâches du workflow. |
| `options`                  | `PublicationRecoveryOptions \| undefined` | Optionnel | Options sélectionnant la source, les capacités d’exécution ou les préconditions de récupération inspectées pour cette opération.       |
| `options.processesStopped` | `true \| undefined`                       | Optionnel | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat.            |

## Retour

`Promise<TransportReference>`

## Signature

```ts
export declare function recoverWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
  action: "finish" | "rollback",
  options?: PublicationRecoveryOptions,
): Promise<TransportReference>;
```

## Contrats associés

- [PublicationRecoveryOptions](../publicationrecoveryoptions/)
- [Transport](../transport/)
- [TransportReference](../transportreference/)
