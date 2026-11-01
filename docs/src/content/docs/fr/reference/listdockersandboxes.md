---
title: "listDockerSandboxes"
description: "listDockerSandboxes — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { listDockerSandboxes } from "@elie-laloum/outpost/providers/docker";
```

## Rôle et comportement

Liste les sandboxes Docker créées par Outpost qui portent chaque label de la requête, quel que soit le repositoryMode du provider qui les a créées. Une sandbox dont le compagnon egress subsiste après la disparition de son conteneur est toujours rapportée sous le nom de la sandbox, afin de pouvoir la supprimer. Les conteneurs qui ne sont pas nommés outpost-&lt;uuid> ne sont jamais rapportés. Le résultat est un instantané trié par nom ; il n’indique pas si une sandbox est encore utilisée. Une commande docker en échec rejette avec le code process.

[Exemple complet et règles détaillées](../../guide/containers/).

## Paramètres et propriétés

| Nom     | Type                    | Présence | Rôle                                                                                                                         |
| ------- | ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `query` | `ContainerSandboxQuery` | Requis   | Labels que chaque sandbox rapportée doit porter, avec le signal d’annulation et le délai appliqués à chaque commande docker. |

## Retour

`Promise<ContainerSandbox[]>`

## Signature

```ts
export declare const listDockerSandboxes: (
  query: ContainerSandboxQuery,
) => Promise<ContainerSandbox[]>;
```

## Contrats associés

- [ContainerSandbox](../containersandbox/)
- [ContainerSandboxQuery](../containersandboxquery/)
