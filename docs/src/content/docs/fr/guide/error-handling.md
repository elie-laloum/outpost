---
title: "Gérer les erreurs"
description: "Examinez les erreurs des agents et des workflows, puis décidez ce qui peut être relancé."
---

## Comprendre les retours d’erreur

L’erreur reçue dépend de l’opération. Un appel d’agent rejette sa promesse en cas d’échec ; un workflow renvoie généralement un résultat contenant les tâches en échec. Le tableau ci-dessous indique comment traiter chaque appel.

| Appel                                                                | En cas d’échec                                                                                                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch()`, `sandbox.dispatch()`                                   | Rejette avec une `OutpostError`.                                                                                                                                  |
| `createSandbox()`                                                    | Rejette avec une `OutpostError`.                                                                                                                                  |
| `sandbox.command()`                                                  | Se résout avec `status`, même non nul. Rejette si la commande est arrêtée : code `timeout` après `deadlineMs`, `aborted` quand la sandbox se ferme.               |
| `defineCommandTask()`                                                | Fait échouer sa tâche avec le code `process` sur un code de sortie non nul.                                                                                       |
| `workflow.start()`                                                   | Se résout avec `status` et `errors`, y compris quand vous l’annulez (`"cancelled"`). `result.unwrap()` lève une `WorkflowFailure` sauf si `status` vaut `"done"`. |
| `steering.send()`                                                    | Rejette avec le code `steering` quand l’instruction n’est pas remise.                                                                                             |
| `dispatch()` ou `sandbox.command()` annulé par votre propre `signal` | Rejette avec la raison du signal, telle que passée à `abort()`, et non une `OutpostError`.                                                                        |

## Examiner une OutpostError

Interceptez une `OutpostError` pour lire son code, son message et les informations de récupération. Relancez les autres erreurs pour qu’elles restent visibles ; les informations de récupération aident à retrouver le travail conservé après un dispatch en échec.

```ts
import { OutpostError, dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/lint-fix" },
    brief: { text: "Fix the lint errors and commit the change." },
  });
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  console.error(error.code, error.message);
  console.error(recoveryDetails(error));
}
```

Référence API : [OutpostError](../../reference/outposterror/).

Utilisez les informations de récupération pour retrouver le travail conservé après un échec.

Référence API : [recoveryDetails](../../reference/recoverydetails/).

[Récupérer le travail](../recovery/) montre comment exploiter ces emplacements.

## Codes d’erreur

Référence API : [FaultCode](../../reference/faultcode/).

## Reconnaître les quotas et les pannes

`quotaFault(error)` et `unavailableFault(error)` examinent l’erreur et jusqu’à sept causes imbriquées. Chacune renvoie `undefined` quand l’échec est d’une autre nature.

```ts
import { quotaFault, unavailableFault } from "@elie-laloum/outpost";

function classify(error: unknown): string {
  const quota = quotaFault(error);
  if (quota) return `Usage limit, resets at ${quota.resetAt ?? "unknown"}`;
  const outage = unavailableFault(error);
  if (outage) return `Service unavailable: ${outage.message}`;
  return "Other failure";
}
```

Une panne garde son code `process`, `provider` ou `timeout`. Reconnaissez-la avec `unavailableFault()`, pas avec le code. [Pauses de quota](../quota-pauses/) précise quels signaux comptent comme un quota.

Un délai de connexion dépassé garde le code `timeout`. Quand une CLI d’agent a signalé en dernier un échec de connexion, `details.agentDiagnostic` vaut `"connection"` et `unavailableFault()` le traite comme une panne. [Diagnostic](../diagnostics/) montre comment vérifier le point d’accès.

## Traiter un workflow en échec

Une tâche en échec ne fait pas rejeter `start()`. Lisez `status` et `errors`, ou appelez `unwrap()` pour lever une exception.

<!-- tabs -->

```ts title="deploy.ts"
import { defineTask, OutpostError } from "@elie-laloum/outpost";

export const deploy = defineTask({
  key: "deploy",
  perform: () => {
    throw new OutpostError("provider", "Deployment returned HTTP 502", {
      status: 502,
    });
  },
});
```

```ts title="run-deploy.ts"
import { reportValue } from "./reporter.ts";
import {
  defineWorkflow,
  WorkflowFailure,
  OutpostError,
} from "@elie-laloum/outpost";
import { deploy } from "./deploy.ts";

export const result = await defineWorkflow("release", [deploy]).start();
try {
  result.unwrap();
} catch (error) {
  if (!(error instanceof WorkflowFailure)) throw error;
  const [first] = error.result.errors;
  if (first instanceof OutpostError) reportValue(first.code, first.details);
  // Example output: provider { status: 502 }
}
```

<!-- check:run -->

`WorkflowFailure.cause` est la première entrée de `errors` : `quotaFault()` et `unavailableFault()` s’appliquent donc directement à elle. `unwrap()` lève aussi une exception pour les exécutions `"paused"`, `"waiting-input"` et `"cancelled"`.

Référence API : [WorkflowFailure](../../reference/workflowfailure/), [WorkflowBudgetExceeded](../../reference/workflowbudgetexceeded/), [WorkflowUsageUnavailable](../../reference/workflowusageunavailable/), [LoopTaskExhausted](../../reference/looptaskexhausted/), [ResponseError](../../reference/responseerror/), [ReplayDivergence](../../reference/replaydivergence/) et [TransportConflict](../../reference/transportconflict/).

## Relancer à bon escient

Une tâche n’est relancée que si elle a une politique `retry` ; `accepts` choisit les erreurs concernées ; sans lui, tout échec est relancé. Relancez les pannes et les délais dépassés ; ne relancez pas `configuration`, `prompt` ni `conflict`.

```ts
import { defineTask, unavailableFault } from "@elie-laloum/outpost";

const report = defineTask({
  key: "report",
  retry: {
    attempts: 3,
    delayMs: 1_000,
    backoff: "exponential",
    accepts: (error) => unavailableFault(error) !== undefined,
  },
  perform: () => "Replace with your request",
});
```

Une nouvelle tentative exécute toute la tâche et peut répéter ses effets. [Concurrence, reprises et délais](../concurrency-and-retries/) détaille les options et `Retry-After`.

## Journaliser sans fuite

Journalisez `code`, `message` et `recoveryDetails(error)`. N’affichez pas `details` ni l’erreur entière : un processus en échec transporte le `stdout` et le `stderr` de l’agent, et `ResponseError.raw` contient sa réponse. Les deux peuvent contenir du code du dépôt ou des secrets que l’agent a affichés.

Pour le récit complet d’un dispatch en échec, ouvrez son [journal](../journals/) à partir du champ de récupération `logReference`.

## Limites

- Certains échecs sont de simples `Error` : définitions de tâche ou de workflow invalides, et [checkpoint](../durable-runs/) déjà détenu par un autre processus.
- Un `timeout` ne prouve pas que les effets externes ont été annulés. Vérifiez la branche conservée avant de relancer.

API : [OutpostError](../../reference/outposterror/) · [FaultCode](../../reference/faultcode/) · [recoveryDetails](../../reference/recoverydetails/) · [quotaFault](../../reference/quotafault/) · [unavailableFault](../../reference/unavailablefault/) · [WorkflowFailure](../../reference/workflowfailure/) · [WorkflowResult](../../reference/workflowresult/) · [ResponseError](../../reference/responseerror/) · [TransportConflict](../../reference/transportconflict/)
