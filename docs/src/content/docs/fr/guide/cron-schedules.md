---
title: "Planification cron"
description: "Publier un job de workflow à chaque créneau cron, dans votre fuseau horaire, sans doublon entre redémarrages et réplicas."
---

## Publier un job selon une planification

`createCronSchedule()` lit une expression cron dans un fuseau horaire IANA. `runSchedules()` publie un job de file par créneau jusqu’à l’interruption de son signal.

```ts title="scheduler.mts"
import {
  createCronSchedule,
  createSqliteTaskQueue,
  runSchedules,
} from "@elie-laloum/outpost";

const timeZone = "Europe/Paris";
// en-CA formate la date locale en AAAA-MM-JJ.
const day = (slot: Date) => slot.toLocaleDateString("en-CA", { timeZone });

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
      {
        name: "nightly-audit",
        cron: createCronSchedule("0 2 * * 1-5", { timeZone }),
        handler: "audit",
        runId: (slot) => `audit-${day(slot)}`,
        input: (slot) => ({ day: day(slot) }),
      },
    ],
  });
} finally {
  queue.close();
}
```

```sh
node scheduler.mts
```

À 02:00 heure de Paris, du lundi au vendredi, le planificateur publie un job pour le handler `audit` avec un `runId` comme `audit-2026-09-30`. Ctrl+C interrompt le signal et `runSchedules()` se résout.

Sans `timeZone`, l’expression est évaluée en UTC. `runId` vaut par défaut `<name>:<heure ISO du créneau>` et `input` vaut `null`.

## Exécuter les jobs publiés

Un worker ouvre la même file et enregistre `audit` avec `defineWorkflowJob()`, qui exécute un workflow avec checkpoint par `runId` : voir [Files de jobs et workers](../job-queues/). La recette [Maintenance nocturne](../nightly-maintenance/) montre le planificateur et le worker ensemble.

## Écrire l’expression cron

Une expression compte cinq champs séparés par des espaces : minute, heure, jour du mois, mois, jour de la semaine.

| Syntaxe          | Exemple           | Déclenchement                                                                                                                 |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Valeur, `*`      | `30 2 * * *`      | À 02:30 chaque jour ; `*` accepte toute valeur.                                                                               |
| Liste            | `0 9,18 * * *`    | À 09:00 et à 18:00.                                                                                                           |
| Intervalle       | `0 9 * * 1-5`     | À 09:00, du lundi au vendredi.                                                                                                |
| Pas              | `0 8-18/2 * * *`  | À 08:00, 10:00, …, 18:00. `*/15` dans le champ des minutes signifie toutes les 15 minutes.                                    |
| Noms             | `0 9 1 JAN,JUL *` | À 09:00 le 1er janvier et le 1er juillet. Les noms `JAN`–`DEC` et `SUN`–`SAT` ignorent la casse ; `0` et `7` valent dimanche. |
| Macro            | `@daily`          | À 00:00 chaque jour. Aussi `@hourly`, `@midnight`, `@weekly`, `@monthly`, `@yearly` et `@annually`.                           |
| Deux champs jour | `0 9 1 * MON`     | À 09:00 le 1er du mois et chaque lundi, comme dans Vixie cron.                                                                |

Cette union ne s’applique que si aucun des deux champs de jour ne commence par `*` ; sinon, un jour doit correspondre aux deux champs. Il n’y a pas de champ des secondes.

## Nommer chaque exécution d’après sa date locale

`slot.toISOString().slice(0, 10)` donne la date UTC. À 01:00 à Paris, c’est encore la veille.

Utilisez `slot.toLocaleDateString("en-CA", { timeZone })` avec le fuseau horaire de la planification, comme dans le premier extrait, pour obtenir la date locale au format `AAAA-MM-JJ`.

## Heure d’été

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
```

<!-- check:run -->

Ce code affiche `2026-03-30T00:30:00.000Z` : 02:30 n’existe pas à Paris le 29 mars 2026.

`createCronSchedule()` lève une erreur pour un champ invalide, un fuseau horaire inconnu ou une expression sans aucune occurrence, comme `0 0 30 2 *`.

## Planifier depuis la CI

Sans processus de longue durée, un job CI planifié, comme un workflow GitHub Actions `schedule`, peut démarrer le workflow directement avec un checkpoint. Voir [Exécuter en CI](../ci-automation/).

## Limites

- La résolution la plus fine est la minute.
- Après une interruption, seul le dernier créneau manqué dans `maxLateMs` est publié.
- Le `name` d’une planification est unique et n’utilise que des lettres, des chiffres, `.`, `_` et `-` (128 caractères au plus). Un `runId` compte au plus 256 caractères.

API : [createCronSchedule](../../reference/createcronschedule/) · [runSchedules](../../reference/runschedules/) · [TriggerSchedule](../../reference/triggerschedule/) · [CronSchedule](../../reference/cronschedule/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
