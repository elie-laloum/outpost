---
title: "Limites et annulation"
description: "Borner la durée d’une tâche d’agent, relancer son brief jusqu’à ce que l’agent la déclare terminée et l’arrêter depuis votre code."
---

## Borner une tâche

Chaque dispatch s’exécute déjà sous des limites par défaut. Fixez les vôtres dans la requête, à côté du brief.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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
```

Si l’agent tourne plus de 20 minutes, ou reste muet pendant 5, la promesse est rejetée avec une [`OutpostError`](../error-handling/) de code `timeout`. La sandbox est libérée ; la branche garde ce que l’agent a commité.

## Choisir une limite

| Option          | Borne                                                                 | Défaut                    | Quand elle est atteinte                   |
| --------------- | --------------------------------------------------------------------- | ------------------------- | ----------------------------------------- |
| `deadlineMs`    | Chaque tour d’agent : un processus CLI, ou un tour du harness intégré | 1 heure                   | Rejet avec le code `timeout`              |
| `idleMs`        | Durée sans aucune sortie de l’agent                                   | 10 minutes                | Rejet avec le code `timeout`              |
| `idleWarningMs` | Silence avant chaque événement `warning`                              | 60 secondes               | Émet un événement ; l’agent continue      |
| `passes`        | Nombre d’envois du brief                                              | 1                         | Résout avec `completed: false`            |
| `until`         | Marqueurs de fin qui arrêtent les passes                              | `<outpost>done</outpost>` | Arrêt à la première passe qui le contient |
| `settleMs`      | Temps laissé à l’agent après son marqueur                             | 60 secondes               | Arrête le processus, garde le résultat    |
| `signal`        | Annulation depuis votre code                                          | Aucun                     | Rejet avec la raison du signal            |

Votre callback `observe` reçoit un événement `stopped` dont le champ `reason` indique ce qui a arrêté le processus : `deadline`, `idle-timeout`, `completion` ou `aborted`.

## Annuler depuis votre code

Passez un `AbortSignal`. Ici, Ctrl+C arrête l’agent au lieu de le laisser tourner dans la sandbox.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

## Relancer le brief jusqu’à ce que l’agent le déclare terminé

`passes` renvoie le brief quand une passe se termine sans marqueur de fin. Demandez le marqueur dans le brief : Outpost ne l’ajoute pas.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/flaky-tests" },
  brief: {
    text: "Fix the flaky tests and commit. When every test passes, end your answer with READY_FOR_REVIEW.",
  },
  passes: 3,
  until: "READY_FOR_REVIEW",
});
console.log(result.completed, result.completion);
```

Chaque passe démarre une nouvelle conversation sur la même branche : elle voit donc les commits précédents. Outpost s’arrête à la première passe dont la réponse contient un marqueur. `until` accepte aussi une liste ; `until: []` désactive la recherche et exécute toutes les passes.

`result.completed` vaut `true` quand un marqueur a été trouvé, et `result.completion` le nomme. Un dispatch qui épuise ses passes est tout de même résolu, avec `completed: false`.

:::caution
Un marqueur est une déclaration de l’agent, pas une preuve. Lancez vos tests avant de vous y fier ; les [boucles de vérification](../verification-loops/) relancent l’agent jusqu’à ce que votre contrôle passe.
:::

Si l’agent écrit son marqueur mais continue de tourner, Outpost l’arrête `settleMs` après sa dernière sortie. Le résultat est conservé et `warn` reçoit un message.

## Borner les étapes du workspace

`limits` fixe des délais aux étapes Git et fichiers qui entourent l’agent. Passez-le à `dispatch()`, `createWorkspace()` ou `createSandbox()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
  brief: { text: "Update the lockfile and commit the change." },
  limits: { gitMs: 120_000, mergeMs: 120_000 },
});
```

| Champ       | Borne                                                               | Défaut                                   |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------- |
| `copyMs`    | La copie de `copies` dans le worktree ; chaque transfert de sandbox | 60 secondes ; 120 secondes par transfert |
| `gitMs`     | Chaque commande Git qui prépare le worktree                         | 30 secondes                              |
| `collectMs` | La lecture des nouveaux commits après l’agent                       | 30 secondes                              |
| `mergeMs`   | La fusion de la branche de travail dans sa base (`integrate`)       | 30 secondes                              |

## Autres limites

<!-- features -->

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
