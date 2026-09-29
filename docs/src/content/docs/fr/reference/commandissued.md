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

Renvoie le texte qui suit command sur la première ligne d’un commentaire GitHub ou GitLab nouvellement créé qui vaut ou commence par cette commande, ou dans une commande slash Slack correspondante ; sinon undefined. Les commentaires modifiés sont ignorés, et une commande qui n’est pas un mot unique lève une erreur. Elle n’autorise pas l’acteur ; comparez event.actor à une liste d’autorisation.

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Paramètres et propriétés

| Nom       | Type           | Présence | Rôle                                                                                                                                                          |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event`   | `TriggerEvent` | Requis   | Événement vérifié provenant d’une source GitHub, GitLab ou Slack.                                                                                             |
| `command` | `string`       | Requis   | Mot unique qui ouvre la commande, comme /outpost ; pour Slack, il doit être égal au nom de la commande slash. Une valeur contenant un espace lève une erreur. |

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
