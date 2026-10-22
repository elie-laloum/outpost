---
title: "FileAgentCapability"
description: "FileAgentCapability — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileAgentCapability } from "@elie-laloum/outpost/core";
```

## Rôle et comportement

Capacité de workspace de fichiers qu’un agent CLI doit avoir démontrée : dispatch, continuation, repairs, liveInput ou interactive. Outpost refuse une capacité non déclarée au lieu de l’essayer.

[Exemple complet et règles détaillées](../../guide/sandbox-sessions/).

## Signature

```ts
export type FileAgentCapability = keyof NonNullable<
  AgentFeatures["fileWorkspaces"]
>;
```

## Contrats associés

- [AgentFeatures](../support-agentfeatures/)
