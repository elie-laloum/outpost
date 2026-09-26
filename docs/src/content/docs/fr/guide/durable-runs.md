---
title: "Exécutions persistantes"
description: "Conserver la progression et autoriser le rejeu."
---

Un checkpoint stocke les états des tâches, sorties et consommations cumulées sous un identifiant d’exécution stable. Les tâches réussies enregistrées peuvent être restaurées sans être réexécutées.

```ts
import {
  localTransport,
  task,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

const store = workflowCheckpointStore({
  transporter: localTransport({ directory: ".outpost/storage" }),
});
const scan = task({ key: "scan", perform: () => ({ files: 12 }) });
const result = await workflow("scan", [scan]).start({
  checkpoint: { store, runId: "scan-2026-09", version: "1" },
});
result.unwrap();
console.log(result.value(scan));
```

<!-- check:run -->

## Reprendre le travail incomplet

Utilisez la même définition de workflow, le même identifiant et la même version. Ajoutez `resume: "retry-incomplete"` aux options de checkpoint pour autoriser le rejeu des tâches inachevées et de leurs effets. Changez `version` lorsque les implémentations ou entrées changent ; elle participe à l’identité du checkpoint.

Les sorties doivent être du JSON sans perte ou `undefined`. Dates, fonctions, objets cycliques et valeurs ne supportant pas un aller-retour JSON doivent être convertis ou stockés en artefacts. Persistez de petites références pour les gros contenus.

## Récupérer la propriété

La propriété du checkpoint n’expire pas automatiquement. Après un crash, arrêtez indépendamment l’ancien runner, inspectez la révision stockée, puis appelez `recoverWorkflowCheckpoint({ transporter, runId, revision })`. Une révision modifiée refuse la récupération. Libérer la propriété préserve la progression et n’autorise pas à lui seul le rejeu.

API : [workflowCheckpointStore](../../reference/function-workflowcheckpointstore/) · [WorkflowCheckpointOptions](../../reference/workflowcheckpointoptions/) · [recoverWorkflowCheckpoint](../../reference/recoverworkflowcheckpoint/).
