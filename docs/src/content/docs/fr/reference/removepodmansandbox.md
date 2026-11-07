---
title: "removePodmanSandbox"
description: "removePodmanSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { removePodmanSandbox } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Supprime par son nom une sandbox Podman et son compagnon egress, quel que soit le repositoryMode du provider qui l’a créée. Les conteneurs déjà disparus sont ignorés, si bien qu’un appel répété réussit. Un nom autre que outpost-&lt;uuid> est refusé avec le code configuration avant toute commande podman. Le conteneur est supprimé même si un bail l’utilise encore ; les commandes suivantes de ce bail échouent et son release reste sûr.

[Exemple complet et règles détaillées](../../guide/containers/).

## Paramètres et propriétés

| Nom                  | Type                           | Présence  | Rôle                                                                                                                                                  |
| -------------------- | ------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | `string`                       | Requis    | Nom de la sandbox, tel que rapporté par listPodmanSandboxes ou reçu par SandboxContext.registerRecovery.                                              |
| `options`            | `TransferOptions \| undefined` | Optionnel | Signal d’annulation et délai appliqués à chaque commande podman de la suppression.                                                                    |
| `options.signal`     | `AbortSignal \| undefined`     | Optionnel | Annulation coopérative de la suppression ; l’abandon arrête la commande podman en cours et rejette.                                                   |
| `options.deadlineMs` | `number \| undefined`          | Optionnel | Durée maximale en millisecondes de chaque commande podman de la suppression, 10000 par défaut ; au-delà, la suppression rejette avec le code timeout. |

## Retour

`Promise<void>`

## Signature

```ts
export declare const removePodmanSandbox: (
  name: string,
  options?: TransferOptions,
) => Promise<void>;
```

## Contrats associés

- [TransferOptions](../transferoptions/)
