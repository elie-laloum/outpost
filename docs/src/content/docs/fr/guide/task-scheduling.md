---
title: "Ordonnancement et reprises"
description: "Contrôler concurrence, propagation des échecs et tentatives."
---

Définissez `concurrency` sur `start()` et la politique de reprise sur chaque tâche. Les reprises sont explicites car une nouvelle tentative peut répéter des effets.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const check = defineTask({
  key: "check",
  retry: { attempts: 2, delayMs: 100 },
  timeoutMs: 5_000,
  perform: ({ signal, attempt }) => {
    signal.throwIfAborted();
    return { attempt, ok: true };
  },
});
const result = await defineWorkflow("checks", [check]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.status);
```

<!-- check:run -->

## Reprises progressives

Le délai fixe existant reste le comportement par défaut. `backoff: "exponential"` double `delayMs` après chaque échec ; `maxDelayMs` plafonne le délai local (30 secondes par défaut en mode exponentiel) ; `jitter: "full"` répartit uniformément les reprises entre zéro et ce délai plafonné. L’aléa vaut `"none"` par défaut. Configurez un `delayMs` positif pour obtenir une attente progressive utile.

```ts
import { OutpostError, defineTask, defineWorkflow } from "@elie-laloum/outpost";

const request = defineTask({
  key: "request",
  retry: {
    attempts: 4,
    delayMs: 500,
    backoff: "exponential",
    maxDelayMs: 10_000,
    jitter: "full",
    accepts: (error) =>
      error instanceof OutpostError &&
      [429, 503].includes(Number(error.details.status)),
  },
  perform: ({ signal }) => {
    signal.throwIfAborted();
    return "Remplacez par votre requête annulable";
  },
});
const result = await defineWorkflow("requests", [request]).start({
  timeoutMs: 60_000,
});
result.unwrap();
```

Les fournisseurs HTTP de modèles conservent les en-têtes `Retry-After` valides (secondes ou date HTTP) dans `OutpostError.details.retryAfterMs`. La reprise de tâche attend au minimum cette durée, même au-delà de `maxDelayMs`, sans la réduire par l’aléa. Les en-têtes invalides sont ignorés ; une date passée donne zéro. Une intégration personnalisée peut lever une `OutpostError` avec un `details.retryAfterMs` fini, positif ou nul, inférieur ou égal à `Number.MAX_SAFE_INTEGER`, en millisecondes. Les erreurs arbitraires de clients HTTP et stderr des CLI ne sont pas analysés automatiquement.

Les reprises exigent toujours une politique explicite de tâche et respectent `accepts`. Les fournisseurs ne relancent pas eux-mêmes les requêtes : rejouer une tâche peut répéter ses appels d’outils ou autres effets antérieurs. Les événements de reprise exposent le `delayMs` choisi. Les longues attentes sont découpées en segments annulables pour éviter qu’un dépassement de capacité des timers ne provoque une reprise immédiate.

## Délai global du workflow

`start({ timeoutMs })` démarre un délai unique avant l’acquisition du checkpoint et couvre conditions, tentatives, ordonnancement des dépendances et attentes de reprise. Le `timeoutMs` de tâche s’applique toujours indépendamment à chaque tentative. Les deux délais doivent être des entiers positifs dans la plage des timers (au maximum 2 147 483 647 millisecondes).

L’expiration arrête l’admission, annule les tâches actives via `context.signal` et retourne `status: "failed"` avec une `OutpostError` de `code: "timeout"` dans `errors`. Une annulation externe survenue en premier conserve `status: "cancelled"`. Les valeurs déjà terminées restent disponibles ; les valeurs tardives sont refusées. Nettoyage et persistance sont attendus : du code ou du stockage ignorant l’annulation peut retarder la fin au-delà du délai.

Chaque appel de reprise à `start()` reçoit un nouveau délai ; le temps entre appels et les pauses d’approbation ne s’accumulent pas. Les checkpoints incomplets exigent toujours `resume: "retry-incomplete"`. Les nouveaux réglages de reprise participent à l’identité du checkpoint ; leur modification rend un checkpoint existant incompatible. Utilisez un nouveau runId et actualisez version lorsque la définition du workflow change. Les checkpoints existants sans ces réglages gardent leur identité. Le backoff repart du délai de base à chaque appel, tandis que les numéros de tentative et l’usage restent cumulés.

## Propagation des échecs

`stopOnError` arrête l’admission de nouveaux travaux après un échec lorsqu’il est activé. Une dépendance échouée empêche la réussite des tâches en aval. Inspectez les statuts et tentatives de chaque tâche, pas seulement le statut global.

`condition` s’évalue avant la première tentative. Utilisez-la pour sauter un travail optionnel selon les dépendances déclarées. Une tâche sautée ne fournit pas de sortie réussie à consommer comme si elle avait tourné.

## Annulation coopérative

Transmettez `context.signal` aux commandes, requêtes réseau et requêtes d’agent. `timeoutMs` signale l’annulation d’une tentative ; il ne peut pas terminer de force du code applicatif arbitraire. `retry.accepts(error, attempt)` limite les erreurs autorisant une reprise.

N’exécutez pas d’opérations concurrentes dans une même sandbox empruntée. Ajoutez des dépendances ou allouez des environnements distincts avec `defineIsolatedTask`.

API : [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [Retry](../../reference/retry/).
