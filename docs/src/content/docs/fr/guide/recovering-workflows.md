---
title: "Récupérer un workflow après un plantage"
description: "Libérez la propriété d’un checkpoint arrêté avant d’autoriser le rejeu du travail interrompu."
---

Partez de [Enregistrer et reprendre un workflow](../durable-runs/) et de sa configuration. Libérez la propriété d’un checkpoint arrêté avant d’autoriser le rejeu du travail interrompu.

## Récupérer une exécution après un plantage

Une exécution possède son checkpoint pendant `start()` et le libère quand `start()` se termine. Si le processus meurt, la propriété reste : tout `start()` suivant pour ce `runId` est refusé jusqu’à ce que vous la libériez.

1. Arrêtez l’ancien processus et confirmez sa fin. L’absence d’un PID local ne prouve pas l’arrêt d’un processus distant.
2. Lisez la révision actuelle du checkpoint, puis transmettez-la à `recoverWorkflowCheckpoint()`. La récupération conserve la progression et refuse une révision modifiée.
3. Redémarrez le même workflow et checkpoint avec `resume: "retry-incomplete"` pour autoriser explicitement une nouvelle tentative des tâches interrompues.

```ts
import { createHash } from "node:crypto";
import {
  createLocalTransport,
  recoverWorkflowCheckpoint,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const runId = "scan-2026-09";
const digest = createHash("sha256").update(runId).digest("hex");
const saved = await transporter.read(`checkpoints/${digest}.json`);
if (saved)
  await recoverWorkflowCheckpoint({
    transporter,
    runId,
    revision: saved.revision,
  });
```

La clé du checkpoint est `checkpoints/` suivi du SHA-256 du `runId`. La progression reste intacte ; relancez l’exécution avec `resume: "retry-incomplete"`.
