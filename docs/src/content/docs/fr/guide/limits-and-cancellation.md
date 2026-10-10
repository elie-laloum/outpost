---
title: "Fixer des délais et annuler une tâche"
description: "Limitez la durée d’exécution de l’agent, réglez les passages successifs et annulez depuis votre code."
---

Utilisez la [configuration initiale](../setup/) pour ces exemples. Choisissez les délais avant une exécution sans surveillance et prévoyez l’inspection de la branche après annulation. Le [budget du workflow](../budgets/) limite séparément le travail cumulé.

## Limiter la durée d’une tâche

Définissez les délais à côté du brief si la tâche demande des limites plus strictes que celles par défaut. Vous pouvez limiter la durée totale d’un échange et le temps pendant lequel l’agent peut rester silencieux.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/parser-fix" },
  brief: { text: "Fix the parser and commit the change." },
  deadlineMs: 20 * 60_000,
  idleMs: 5 * 60_000,
});
console.log(result.text);
// Example output: Fixed the failing tests and committed the change.
```

Si l’agent tourne plus de 20 minutes, ou reste muet pendant 5, la promesse est rejetée avec une [`OutpostError`](../error-handling/) de code `timeout`. La sandbox est libérée ; la branche garde ce que l’agent a commité.

## Choisir une limite

`deadlineMs` limite la durée totale d’un dispatch ; `idleMs` surveille son silence. Une tentative de tâche utilise `timeoutMs`, et le workflow impose son propre délai avec `start({ timeoutMs })`. Commencez par le délai total, puis ajoutez la surveillance du silence seulement si une longue opération silencieuse doit être interrompue.

Référence API : [DispatchOptions](../../reference/dispatchoptions/).

Votre fonction de rappel `observe` reçoit un événement `stopped` dont le champ `reason` indique ce qui a arrêté le processus : `deadline`, `idle-timeout`, `completion` ou `aborted`.

## Annuler depuis votre code

Passez un `AbortSignal`. Ici, Ctrl+C arrête l’agent au lieu de le laisser tourner dans la sandbox.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const controller = new AbortController();
process.once("SIGINT", () => controller.abort("cancelled by user"));

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/refactor" },
    brief: { text: "Refactor the auth module and commit the change." },
    signal: controller.signal,
  });
} catch (error) {
  console.error(error, recoveryDetails(error));
}
```

La promesse est rejetée avec la valeur passée à `abort()`, ici `"cancelled by user"`. `AbortSignal.timeout(ms)` fonctionne de la même façon pour un délai qui couvre toutes les passes.

| Après un arrêt    | `dispatch()`                                        | `sandbox.dispatch()` dans une [session](../sandbox-sessions/) |
| ----------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| Processus d’agent | Son groupe de processus et ses descendants terminés | Idem                                                          |
| Sandbox           | Libérée                                             | Toujours active, prête pour le dispatch suivant               |
| Worktree, branche | Conservés ; `recoveryDetails(error)` les donne      | Conservés                                                     |

Pour changer la direction de l’agent sans l’arrêter, [réorientez-le](../steering/) plutôt.

<span id="relancer-le-brief-jusquà-ce-que-lagent-le-déclare-terminé"></span>

Pour cette étape, suivez [Répéter un brief sur plusieurs passes](../agent-passes/).

## Limiter la durée des opérations Git et fichiers

`limits` fixe des délais aux étapes Git et fichiers qui entourent l’agent. Passez-le à `dispatch()`, `createWorkspace()` ou `createSandbox()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
  brief: { text: "Update the lockfile and commit the change." },
  limits: { gitMs: 120_000, mergeMs: 120_000 },
});
```

Référence API : [StageLimits](../../reference/stagelimits/).

## Autres limites

<!-- features -->

- [Détecter les répétitions](../stuck-agents/) : Arrêter, avertir ou rediriger un agent répétant outils ou modifications.

- [Budgets](../budgets/): Plafonds de tokens et de tentatives partagés par les tâches d’un workflow.
- [Concurrence, relances et délais](../concurrency-and-retries/): `timeoutMs` pour chaque tentative de tâche et pour une exécution entière.
- [Harness intégré](../harness/): `limits` sur les étapes, les appels d’outils et la consommation d’une boucle d’agent.
- [Sessions de sandbox](../sandbox-sessions/): `deadlineMs` et `signal` sur une seule commande.
- [Rédiger le brief](../briefs/): `expansionMs` borne les commandes shell d’un brief en fichier.
- [Réorienter un agent en cours](../steering/): Changez de direction sans annuler.

## Limites

- Chaque durée doit être un nombre positif : `0` ne désactive pas une limite.
- `passes` supérieur à 1 ne se combine ni avec `response` ni avec `continuation`.
- Arrêter un agent n’annule rien. Les commits et fichiers déjà écrits restent sur la branche.

API : [dispatch](../../reference/dispatch/) · [DispatchOptions](../../reference/dispatchoptions/) · [DispatchResult](../../reference/dispatchresult/) · [StageLimits](../../reference/stagelimits/) · [recoveryDetails](../../reference/recoverydetails/) · [AgentObservation](../../reference/agentobservation/).
