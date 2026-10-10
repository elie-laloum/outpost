---
title: "Planifier des exécutions régulières"
description: "Publiez des jobs de workflow selon une expression cron et un fuseau horaire explicite."
---

## Publier un job selon une planification

Créez une planification avec `createCronSchedule()`, une expression cron et un fuseau horaire. `runSchedules()` publie un job dans la file à chaque horaire prévu, jusqu’à l’annulation de son signal. Un worker exécute le job séparément.

<!-- tabs -->

```ts title="audit-schedule.ts"
import { createCronSchedule } from "@elie-laloum/outpost";

export const timeZone = "Europe/Paris";
export const day = (slot: Date) =>
  slot.toLocaleDateString("en-CA", { timeZone });
export const schedules = [
  {
    name: "nightly-audit",
    cron: createCronSchedule("0 2 * * 1-5", { timeZone }),
    handler: "audit",
    runId: (slot: Date) => `audit-${day(slot)}`,
    input: (slot: Date) => ({ day: day(slot) }),
  },
];
```

```ts title="scheduler.ts"
import { createSqliteTaskQueue, runSchedules } from "@elie-laloum/outpost";
import { schedules } from "./audit-schedule.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({ queue, signal: stop.signal, schedules });
} finally {
  queue.close();
}
```

### Exécuter le script

À 02:00 heure de Paris, du lundi au vendredi, le planificateur publie un job pour le traitement `audit` avec un `runId` comme `audit-2026-09-30`. Ctrl+C interrompt le signal et `runSchedules()` se résout.

```sh
node scheduler.ts
```

Référence API : [CronOptions](../../reference/cronoptions/).

## Exécuter les jobs publiés

Un worker ouvre la même file et enregistre `audit` avec `defineWorkflowJob()`, qui exécute un workflow avec checkpoint par `runId` : voir [Files de jobs et workers](../job-queues/). La recette [Maintenance nocturne](../nightly-maintenance/) montre le planificateur et le worker ensemble.

## Écrire l’expression cron

Utilisez cinq champs dans l’ordre minute, heure, jour du mois, mois et jour de semaine. Par exemple, `0 2 * * 1-5` prévoit 02:00 en semaine ; `@daily` prévoit minuit. Définissez explicitement `timeZone` si l’heure locale compte. Le contrat de [createCronSchedule](../../reference/createcronschedule/) décrit les noms, plages, pas, macros et la combinaison des deux champs de jour.

## Nommer chaque exécution d’après sa date locale

`slot.toISOString().slice(0, 10)` donne la date UTC. À 01:00 à Paris, c’est encore la veille.

Utilisez `slot.toLocaleDateString("en-CA", { timeZone })` avec le fuseau horaire de la planification, comme dans le premier extrait, pour obtenir la date locale au format `AAAA-MM-JJ`.

## Changements d’heure

Les créneaux sont des heures murales dans le fuseau horaire de la planification.

- **Heure sautée** : Une heure qui n’existe pas le jour du passage à l’heure d’été ne se déclenche pas ce jour-là.
- **Heure répétée** : Une heure qui survient deux fois le jour du retour à l’heure d’hiver se déclenche une seule fois, à sa première occurrence.

:::caution
Choisissez une heure en dehors de l’heure de changement locale (02:00–03:00 en Europe) quand un job doit s’exécuter tous les jours.
:::

## Exécuter plusieurs planificateurs

Chaque créneau publie le job `schedule:<name>:<heure ISO du créneau>`. Un planificateur redémarré, ou plusieurs réplicas qui partagent une file, publient le même identifiant de job, et la file n’en garde qu’un.

`runId` et `input` ne doivent dépendre que du créneau. La file refuse une deuxième publication du même identifiant avec une requête différente.

Deux planifications peuvent renvoyer le même `runId` pour un même jour : le second job reprend alors la même exécution avec checkpoint si son `input` est identique (un `input` différent échoue sur un checkpoint incompatible), comme la reprise de 07:00 dans [Maintenance nocturne](../nightly-maintenance/).

## Rattraper un créneau après un redémarrage

Un créneau n’est publié que si au plus `maxLateMs` s’est écoulé depuis (60 000 ms par défaut). Après un redémarrage ou un processus suspendu, seul le dernier créneau manqué dans cette fenêtre est publié ; les plus anciens sont ignorés.

Augmentez `maxLateMs` pour rattraper un créneau manqué pendant une panne plus longue, par exemple `maxLateMs: 6 * 60 * 60_000` pour six heures.

## Gérer les échecs de publication

Sans `onError`, le premier échec de publication arrête toutes les planifications et rejette `runSchedules()`. Avec lui, vous recevez l’erreur avec le nom de la planification et le créneau, et la planification continue avec le créneau suivant.

```ts
import { runSchedules } from "@elie-laloum/outpost";
import type { TaskQueue, TriggerSchedule } from "@elie-laloum/outpost";

function schedule(
  queue: TaskQueue,
  schedules: TriggerSchedule[],
  signal: AbortSignal,
) {
  return runSchedules({
    queue,
    schedules,
    signal,
    onError: (error, { schedule, slot }) =>
      console.error(`${schedule} ${slot.toISOString()}`, error),
  });
}
```

Un créneau en échec n’est pas republié. Les erreurs levées par `onError` sont ignorées.

## Calculer des créneaux sans publier

`next(after)` renvoie le premier créneau strictement après une date, `previous(at)` le dernier créneau à cette date ou avant. Aucune des deux ne publie quoi que ce soit.

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
// Example output: 2026-03-30T00:30:00.000Z
```

<!-- check:run -->

Ce code affiche `2026-03-30T00:30:00.000Z` : 02:30 n’existe pas à Paris le 29 mars 2026.

`createCronSchedule()` lève une erreur pour un champ invalide, un fuseau horaire inconnu ou une expression sans aucune occurrence, comme `0 0 30 2 *`.

## Planifier depuis la CI

Sans processus de longue durée, un job CI planifié, comme un workflow GitHub Actions `schedule`, peut démarrer le workflow directement avec un checkpoint. Voir [Exécuter en CI](../ci-automation/).

## Workspaces de fichiers

Une recette de fichiers utilise le même contrat schedule vers file : le timer publie uniquement son job déterministe et le worker alloue le workspace. Voir [les workspaces de fichiers](../workspaces/) et [les services de recettes](../recipe-services/).

## Limites

- La résolution la plus fine est la minute.
- Après une interruption, seul le dernier créneau manqué dans `maxLateMs` est publié.
- Le `name` d’une planification est unique et n’utilise que des lettres, des chiffres, `.`, `_` et `-` (128 caractères au plus). Un `runId` compte au plus 256 caractères.

API : [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [TriggerSchedule](../../reference/triggerschedule/) · [CronSchedule](../../reference/cronschedule/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
