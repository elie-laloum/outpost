---
title: "commandIssued"
description: "commandIssued — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { commandIssued } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie le texte qui suit une commande dans un commentaire GitHub ou GitLab nouvellement créé, sur la première ligne qui commence par elle, ou dans une commande slash Slack correspondante ; sinon undefined. Les commentaires modifiés sont ignorés. Elle n’autorise pas l’acteur ; comparez event.actor à une liste autorisée.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                                             |
| --------- | -------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `event`   | `TriggerEvent` | Requis   | Événement vérifié provenant d’une source GitHub, GitLab ou Slack.                                                |
| `command` | `string`       | Requis   | Mot unique qui commence la commande, comme /outpost ; pour Slack, il doit être égal au nom de la commande slash. |

## Retour

`TriggerCommand | undefined`

## Signature

```ts
export declare function commandIssued(
  event: TriggerEvent,
  command: string,
): TriggerCommand | undefined;
```

## Contrats associés

- [TriggerCommand](../triggercommand/)
- [TriggerEvent](../triggerevent/)
