---
title: "inspectRecovery"
description: "inspectRecovery — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectRecovery } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecte les fichiers locaux ou objets d’un transport explicite sans les supprimer. Le mode local peut inspecter Git, verrous de processus et ressources ; le mode transport liste tailles, révisions et éventuellement activités dont la propriété distante reste non vérifiée. Les inventaires incomplets sont signalés et n’autorisent pas le nettoyage.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                   | Type                                     | Présence  | Rôle                                                                                                                                                                   |
| --------------------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryInspectionOptions \| undefined` | Optionnel | Choix d’inventaire du dépôt local ou d’un transport, limite d’entrées et inspection optionnelle des ressources. Git et les verrous de processus exigent le mode local. |
| `options.transporter` | `Transport \| undefined`                 | Optionnel | Inventorie les clés d’objets et éventuellement les activités dans ce transport ; l’inspection de Git et des verrous hôtes est incompatible.                            |
| `options.repository`  | `string \| undefined`                    | Optionnel | Checkout Git hôte ciblé.                                                                                                                                               |
| `options.maxEntries`  | `number \| undefined`                    | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                                              |
| `options.git`         | `boolean \| undefined`                   | Optionnel | Inclut l’état Git des worktrees et les contrôles de modifications et verrouillage dans l’inventaire.                                                                   |
| `options.locks`       | `boolean \| undefined`                   | Optionnel | Inclut l’inspection des fichiers de verrou locaux et de leur possession par les processus.                                                                             |
| `options.resources`   | `boolean \| undefined`                   | Optionnel | Inclut les baux de sandbox et opérations actives enregistrés localement.                                                                                               |

## Retour

`Promise<RecoveryInspection>`

## Signature

```ts
export declare function inspectRecovery(
  options?: RecoveryInspectionOptions,
): Promise<RecoveryInspection>;
```

## Contrats associés

- [RecoveryInspection](../recoveryinspection/)
- [RecoveryInspectionOptions](../recoveryinspectionoptions/)
