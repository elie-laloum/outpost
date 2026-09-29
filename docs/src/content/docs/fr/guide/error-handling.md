---
title: "Erreurs"
description: "Savoir comment chaque appel Outpost signale un échec, lire une OutpostError et son code de faute, et choisir quoi relancer."
---

## Savoir comment chaque appel échoue

Outpost signale un échec de trois façons : une promesse rejetée, un statut dans le résultat, ou une exception que vous demandez.

| Appel                                                                | En cas d’échec                                                                                                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch()`, `sandbox.dispatch()`                                   | Rejette avec une `OutpostError`.                                                                                                                                  |
| `createSandbox()`                                                    | Rejette avec une `OutpostError`.                                                                                                                                  |
| `sandbox.command()`                                                  | Se résout avec `status`, même non nul. Rejette si la commande est arrêtée : code `timeout` après `deadlineMs`, `aborted` quand la sandbox se ferme.               |
| `defineCommandTask()`                                                | Fait échouer sa tâche avec le code `process` sur un code de sortie non nul.                                                                                       |
| `workflow.start()`                                                   | Se résout avec `status` et `errors`, y compris quand vous l’annulez (`"cancelled"`). `result.unwrap()` lève une `WorkflowFailure` sauf si `status` vaut `"done"`. |
| `steering.send()`                                                    | Rejette avec le code `steering` quand l’instruction n’est pas remise.                                                                                             |
| `dispatch()` ou `sandbox.command()` annulé par votre propre `signal` | Rejette avec la raison du signal, telle que passée à `abort()`, et non une `OutpostError`.                                                                        |

## Lire une OutpostError

```ts
import { OutpostError, dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

| Champ                    | Contenu                                                                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`                   | Un [code de faute](#codes-de-faute) stable. Branchez votre logique dessus, pas sur `message`.                                                                                                                         |
| `message`                | Une explication lisible, destinée aux humains.                                                                                                                                                                        |
| `details`                | Le contexte structuré : `status` et `retryAfterMs` pour les échecs HTTP, `resetAt` pour les quotas, `unavailable` pour les pannes, `status`, `stdout`, `stderr` et `conversation` pour un processus d’agent en échec. |
| `cause`                  | L’échec d’origine, quand Outpost l’a reclassé.                                                                                                                                                                        |
| `recoveryDetails(error)` | Où le travail a été conservé, par exemple `branch`, `directory`, `commits`, `transcript` et `logReference`. Fonctionne aussi sur les erreurs qui ne sont pas des `OutpostError`.                                      |

Deux échecs indiquent aussi leur emplacement dans `details` :

| Échec                                                | Code        | Champ                                         |
| ---------------------------------------------------- | ----------- | --------------------------------------------- |
| Les changements distants n’ont pas pu être appliqués | `workspace` | `details.recovery` : le dossier du transfert. |
| L’intégration automatique a échoué                   | `conflict`  | `details.directory` : le worktree conservé.   |

[Récupérer le travail](../recovery/) montre comment exploiter ces emplacements.

## Codes de faute

| Code            | Signification                                        | Cause typique                                                                                                         | Que faire                                                                                                     |
| --------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `configuration` | L’appel ou ses réglages sont invalides               | Réglage de modèle non pris en charge, fichier d’identifiants de compte absent, sandbox occupée ou fermée              | Corrigez le code ou la configuration. Relancer n’y change rien.                                               |
| `process`       | Un processus a échoué                                | Agent sorti avec un code non nul ou sans événement final ; tâche de commande sortie avec un code non nul              | Lisez `details.stderr` ; vérifiez `unavailableFault(error)`.                                                  |
| `timeout`       | Un délai a expiré                                    | `deadlineMs`, `idleMs`, le `deadlineMs` d’une commande, `start({ timeoutMs })`, une requête au modèle                 | Augmentez la limite ou découpez la tâche. Voir [Limites et annulation](../limits-and-cancellation/).          |
| `aborted`       | Outpost a arrêté l’opération                         | La sandbox s’est fermée pendant une commande ou un tour                                                               | Relancez dans une sandbox ouverte.                                                                            |
| `workspace`     | Une opération sur le worktree ou un fichier a échoué | Chemin ou lien symbolique dangereux, réservation de stockage refusée, échec de la synchronisation Git distante        | Inspectez le worktree conservé et les fichiers de récupération.                                               |
| `conflict`      | Quelqu’un d’autre a modifié l’état                   | Worktree déjà utilisé, branche extraite ailleurs, modifications sur l’hôte pendant la synchronisation, fusion échouée | Résolvez sur l’hôte, puis relancez.                                                                           |
| `prompt`        | Le brief n’a pas pu être rendu                       | Variable de prompt manquante, commande de prompt en échec                                                             | Corrigez le [brief](../briefs/).                                                                              |
| `response`      | Une réponse n’a pas pu être analysée                 | `ResponseError` : balise absente, JSON invalide, rejet du schéma ; réponse invalide d’un modèle ou d’un serveur MCP   | Autorisez des réparations. Voir [Réponses typées](../typed-responses/).                                       |
| `session`       | Une conversation est indisponible                    | Conversation introuvable dans le stockage natif, transcription absente ou non prise en charge                         | Vérifiez la [conversation](../conversations/) que vous reprenez ou dupliquez.                                 |
| `provider`      | La sandbox ou le service de modèle a échoué          | Sandbox déjà libérée par le provider, transfert de fichiers en échec, erreur HTTP d’un provider de modèle hors quota  | Vérifiez le provider ; `unavailableFault(error)` signale les pannes.                                          |
| `limit`         | Une limite du harness intégré est atteinte           | `maxSteps`, `maxToolCalls`, `maxOutputTokens`, budget de tokens, profondeur de délégation                             | Relevez la limite du [harness](../harness/) ou resserrez le brief.                                            |
| `quota`         | Une limite d’usage ou de débit est atteinte          | Limite d’usage définitive signalée par une CLI d’agent, HTTP 429 ou erreur de quota d’un provider de modèle           | Attendez `resetAt`, [mettez le workflow en pause](../quota-pauses/) ou [passez la main](../fallback-agents/). |
| `replay`        | Un rejeu diffère de son journal                      | `ReplayDivergence`                                                                                                    | Enregistrez de nouveau. Voir [Rejouer sans modèle](../record-replay/).                                        |
| `steering`      | Une instruction n’a pas été remise                   | Le dispatch s’est terminé avant, ou le contrôleur est fermé                                                           | Envoyez-la au dispatch suivant. Voir [Piloter un agent en cours](../steering/).                               |

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

```ts
import {
  OutpostError,
  WorkflowFailure,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const deploy = defineTask({
  key: "deploy",
  perform: () => {
    throw new OutpostError("provider", "Deployment returned HTTP 502", {
      status: 502,
    });
  },
});
const result = await defineWorkflow("release", [deploy]).start();
try {
  result.unwrap();
} catch (error) {
  if (!(error instanceof WorkflowFailure)) throw error;
  const [first] = error.result.errors;
  if (first instanceof OutpostError) console.log(first.code, first.details);
}
// provider { status: 502 }
```

<!-- check:run -->

`WorkflowFailure.cause` est la première entrée de `errors` : `quotaFault()` et `unavailableFault()` s’appliquent donc directement à elle. `unwrap()` lève aussi une exception pour les exécutions `"paused"`, `"waiting-input"` et `"cancelled"`.

| Erreur                     | Où elle apparaît                                                                     | À lire                                                |
| -------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `WorkflowFailure`          | Levée par `unwrap()`                                                                 | `result` : statut, tâches, erreurs, usage.            |
| `WorkflowBudgetExceeded`   | `result.errors` quand un [budget](../budgets/) est épuisé                            | `dimension`, `limit`, `observed`.                     |
| `WorkflowUsageUnavailable` | `result.errors` quand un budget de tokens ne peut pas être appliqué                  | Définissez `budget.attempts` et des délais.           |
| `LoopTaskExhausted`        | `result.errors` après l’échec du dernier tour d’une [boucle](../verification-loops/) | `key`, `maxRounds`, `feedback`.                       |
| `ResponseError`            | Un dispatch ou une tâche d’agent avec un contrat de réponse                          | `tag`, `raw` ; code `response`.                       |
| `ReplayDivergence`         | Un agent de rejeu                                                                    | `kind`, `turn`, `expected`, `actual` ; code `replay`. |
| `TransportConflict`        | Une écriture conditionnelle dans le [stockage](../storage/)                          | `key`. Relisez l’objet avant de réessayer.            |

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

- Certains échecs sont de simples `Error` : définitions de tâche ou de workflow invalides, et [checkpoint](../durable-runs/) déjà détenu par un autre runner.
- Un `timeout` ne prouve pas que les effets externes ont été annulés. Vérifiez la branche conservée avant de relancer.

API : [OutpostError](../../reference/outposterror/) · [FaultCode](../../reference/faultcode/) · [recoveryDetails](../../reference/recoverydetails/) · [quotaFault](../../reference/quotafault/) · [unavailableFault](../../reference/unavailablefault/) · [WorkflowFailure](../../reference/workflowfailure/) · [WorkflowResult](../../reference/workflowresult/) · [ResponseError](../../reference/responseerror/) · [TransportConflict](../../reference/transportconflict/)
