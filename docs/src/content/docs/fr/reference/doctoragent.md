---
title: "DoctorAgent"
description: "DoctorAgent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DoctorAgent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Agent intégré visé par un diagnostic : l’argument agent de diagnoseAgentProtocol(), l’option agent de diagnoseSandbox() et l’agent indiqué dans un rapport doctor. Mêmes valeurs que BuiltInAgentName.

[Exemple complet et règles détaillées](../../guide/diagnostics/).

## Signature

```ts
export type DoctorAgent = BuiltInAgentName;
```

## Contrats associés

- [BuiltInAgentName](../support-builtinagentname/)
