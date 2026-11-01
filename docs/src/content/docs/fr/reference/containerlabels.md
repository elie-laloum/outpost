---
title: "ContainerLabels"
description: "ContainerLabels — Outpost API"
sidebar:
  order: 10
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerLabels } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerLabels } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Labels de conteneur sous forme de chaînes clé-valeur : ContainerOptions.labels à la création, le sélecteur ContainerSandboxQuery.labels et les labels rapportés dans ContainerSandbox. Dans les labels qu’Outpost pose ou sélectionne, les clés commencent par une lettre ou un chiffre et ne contiennent que lettres, chiffres, ., _, / et - (255 caractères au plus) ; le préfixe io.outpost. est réservé à Outpost. Les valeurs sont des chaînes non vides de 1024 caractères au plus, sans caractère de contrôle.

[Exemple complet et règles détaillées](../../guide/containers/).

## Signature

```ts
export type ContainerLabels = Readonly<Record<string, string>>;
```
