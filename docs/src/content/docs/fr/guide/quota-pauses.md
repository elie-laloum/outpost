---
title: "Pauses sur quota"
description: "Mettre un workflow en pause quand un abonnement ou une API atteint sa limite, puis le reprendre après la réinitialisation."
---

Implémenté sur main, pas encore publié. Avec `onQuota`, une tâche qui atteint une limite d’usage ou reçoit un HTTP 429 se met en pause au lieu d’échouer. Le workflow la reprend après la réinitialisation, dans le même appel à `start()` ou dans un appel ultérieur avec le même checkpoint.

```ts
import {
  localTransport,
  OutpostError,
  task,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

let calls = 0;
const review = task({
  key: "review",
  perform: () => {
    if (++calls === 1)
      throw new OutpostError("quota", "You've hit your session limit", {
        resetAt: new Date(Date.now() + 50).toISOString(),
      });
    return "reviewed";
  },
});
const result = await workflow("nightly", [review]).start({
  checkpoint: {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory: ".outpost/storage" }),
    }),
    runId: "nightly-2026-09-28",
    version: "1",
  },
  onQuota: { action: "pause", maxWaitMs: 6 * 60 * 60_000 },
});
result.unwrap();
console.log(result.value(review));
```

<!-- check:run -->

Ici, la limite simulée se réinitialise après 50 ms, dans la fenêtre `maxWaitMs` : le workflow attend puis relance la tâche. En usage réel, ce sont les tâches d’agent et de modèle qui lèvent elles-mêmes les erreurs de quota.

## Ce qui compte comme quota

Outpost rejette avec une `OutpostError` de code `quota` dans les cas suivants :

| Source                      | Signal                                                                                    | Heure de réinitialisation            |
| --------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| Claude Code                 | `rate_limit_event` refusé, erreur assistant `rate_limit`/`billing_error`, texte de limite | Depuis `resetsAt` lorsqu’il existe   |
| Codex                       | texte d’échec de limite d’usage, de quota dépassé ou de 429 épuisé                        | Inconnue                             |
| GitHub Copilot CLI          | `session.error` de type `quota` ou `rate_limit`, texte de limite                          | Inconnue                             |
| Kimi Code                   | texte d’épuisement de quota dans sa sortie d’échec ou sur stderr                          | Inconnue                             |
| Antigravity                 | texte d’échec de quota épuisé ou `RESOURCE_EXHAUSTED`                                     | Inconnue                             |
| Modèles OpenAI et Anthropic | HTTP 429, ou erreur de flux de type limite de débit ou quota insuffisant                  | Depuis `Retry-After` s’il est valide |

Pour les agents CLI, un signal ne reclasse qu’un tour dont le processus d’agent échoue. Les avis de reprise transitoires, comme `api_retry` de Claude ou `turn.step.retrying` de Kimi, ne sont pas des quotas. Les heures de réinitialisation rédigées en texte ne sont pas analysées ; elles restent dans le message.

Utilisez `quotaFault(error)` pour lire le message et l’heure de réinitialisation d’une erreur interceptée, y compris imbriquée.

## Pause et reprise

Une erreur de quota termine la tentative en cours sans consommer les tentatives de `retry`. La tâche passe en `paused` avec un enregistrement `quota`, puis le checkpoint est sauvegardé. Ensuite :

- Si la réinitialisation est connue, future et comprise dans `maxWaitMs`, la tâche attend dans le processus puis est relancée. Un événement `quota` indique `status: "waiting"` et `delayMs`.
- Sinon, la tâche reste en pause. Les tâches indépendantes continuent ; les tâches dépendantes attendent. Le workflow renvoie `paused` lorsque plus rien ne peut s’exécuter.
- Un `start()` ultérieur avec le même checkpoint relance une tâche en pause sur quota si sa réinitialisation est inconnue ou passée, ou attend d’abord si elle tient dans son `maxWaitMs`. Une réinitialisation plus lointaine la laisse en pause sans appeler l’agent.

`maxWaitMs` vaut `0` par défaut : sans lui, les pauses sont toujours durables, ce qui évite de bloquer sandboxes et processus pendant des heures. Dimensionnez-le avec le `timeoutMs` du workflow, qui borne aussi les attentes.

Activer `onQuota` autorise la relance de la tentative interrompue, comme un retry ; `resume: "retry-incomplete"` n’est pas nécessaire. Une annulation pendant l’attente laisse la tâche en pause. Chaque relance compte comme une tentative dans `budget.attempts`. Une [boucle de vérification](../verification-loops/) reprend la phase qui a atteint la limite.

Une relance démarre un nouveau dispatch d’agent. Pour les agents CLI, la conversation interrompue figure dans `details.conversation` de l’erreur de quota, mais la tâche ne la poursuit pas automatiquement.

API : [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [WorkflowQuotaPause](../../reference/workflowquotapause/) · [quotaFault](../../reference/quotafault/) · [WorkflowOptions](../../reference/workflowoptions/).
