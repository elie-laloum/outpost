---
title: "Planification cron"
description: "Publier un job de workflow selon une planification cron, sans doublon entre redémarrages et réplicas."
---

`createCronSchedule()` analyse une expression cron à cinq champs évaluée dans un fuseau horaire IANA (UTC par défaut). `runSchedules()` publie un job par créneau jusqu’à l’interruption de son signal.

```ts
import {
  createCronSchedule,
  runSchedules,
  createSqliteTaskQueue,
} from "@elie-laloum/outpost";

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
        cron: createCronSchedule("0 2 * * 1-5", { timeZone: "Europe/Paris" }),
        handler: "audit",
        runId: (slot) => `audit-${slot.toISOString().slice(0, 10)}`,
        input: (slot) => ({ day: slot.toISOString().slice(0, 10) }),
      },
    ],
  });
} finally {
  queue.close();
}
```

- **Syntaxe.** Minute, heure, jour du mois, mois et jour de la semaine, avec listes (`1,15`), intervalles (`1-5`), pas (`*/10`, `8-18/2`), noms de mois et de jours (`JAN`, `MON-FRI`), `7` pour dimanche et les macros `@hourly`, `@daily`, `@weekly`, `@monthly` et `@yearly`. Comme dans Vixie cron, lorsque les deux champs de jour sont restreints, un jour qui correspond à l’un des deux suffit. Il n’y a pas de champ des secondes.
- **Heure d’été.** Les créneaux sont des heures murales. Une heure sautée au passage à l’heure d’été ne se déclenche pas ; une heure répétée en automne se déclenche une seule fois, à sa première occurrence.
- **Identité des jobs.** Chaque créneau publie le job `schedule:<name>:<heure ISO du créneau>`. Deux planificateurs qui partagent une file, ou un planificateur redémarré, publient le même job, et la file n’en garde qu’un exemplaire. `runId` vaut par défaut `<name>:<heure ISO du créneau>` et `input` vaut `null`.
- **Créneaux en retard.** Un créneau n’est publié que si au plus `maxLateMs` (60 secondes par défaut) s’est écoulé. Après un redémarrage ou un processus suspendu, seul le dernier créneau manqué dans cette fenêtre est publié ; les créneaux plus anciens sont ignorés plutôt que rejoués en rafale.
- **Échecs.** Sans `onError`, le premier échec de publication rejette `runSchedules()`. Avec lui, l’échec est signalé avec la planification et le créneau, et la planification continue.

`createCronSchedule()` refuse une expression sans aucune occurrence, comme `0 0 30 2 *`. Ses méthodes `next()` et `previous()` calculent des créneaux sans rien publier :

```ts
import { createCronSchedule } from "@elie-laloum/outpost";

const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log(nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString());
```

<!-- check:run -->

Ce code affiche `2026-03-30T00:30:00.000Z` : 02:30 n’existe pas à Paris le 29 mars 2026.

Une planification CI, comme un workflow GitHub Actions `schedule` qui lance un script, est une alternative lorsqu’aucun processus de longue durée n’est disponible.
