---
title: "ContainerSandbox"
description: "ContainerSandbox — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerSandbox } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerSandbox } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom      | Type                               | Présence | Rôle                                                                                                                                                                                                                         |
| -------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                           | Requis   | Nom du conteneur de la sandbox, outpost-&lt;uuid>, à passer à removeDockerSandbox ou removePodmanSandbox. Il est aussi rapporté quand seul le compagnon egress subsiste.                                                     |
| `labels` | `Readonly<Record<string, string>>` | Requis   | Labels que le moteur rapporte pour le conteneur de la sandbox, y compris ceux hérités de son image. Quand seul le compagnon egress subsiste, ce sont les labels du compagnon, qui contiennent aussi io.outpost.egress.owner. |

## Signature

```ts
export interface ContainerSandbox {
  readonly name: string;
  readonly labels: ContainerLabels;
}
```

## Contrats associés

- [ContainerLabels](../containerlabels/)
