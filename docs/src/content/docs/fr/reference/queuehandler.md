---
title: "QueueHandler"
description: "QueueHandler — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueHandler**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueHandler } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Retour

`QueueResult | Promise<QueueResult>`

## Signature

```ts
export type QueueHandler = (
  input: WorkflowJson,
  context: QueueHandlerContext,
) => Promise<QueueResult> | QueueResult;
```

## Contrats associés

- [QueueHandlerContext](../queuehandlercontext/)
- [QueueResult](../queueresult/)
- [WorkflowJson](../workflowjson/)
