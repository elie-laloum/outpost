---
title: "Reprendre une compétition de candidats"
description: "Ajoutez la conservation de l’état à une compétition de candidats avant son démarrage."
---

Ajoutez la conservation de l’état à une [compétition de candidats](../speculation/) avant son démarrage. Cette fonctionnalité expérimentale conserve la progression ; rejouer après un arrêt brutal demande toujours une autorisation explicite.

## Reprendre après un arrêt brutal

Passez `durability` à `speculate()`. Tentatives, usage, sorties et ressources allouées sont enregistrés via un [transport](../storage/), et une course terminée est renvoyée sans être relancée.

```ts title="durability.ts"
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "parser-race",
  version: "1",
};
```

Reprenez `candidates.ts` et `validate.ts` de [la première compétition](../speculation/). Ce point d’entrée utilise le même budget à chaque appel.

<!-- example:include speculation candidates.ts validate.ts -->

```ts title="durable-race.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";
import { durability } from "./durability.ts";

const result = await speculate({
  repository,
  sandboxProvider,
  candidates,
  validate,
  budget: { attempts: 2, usage: { output: 20_000 } },
  durability: {
    ...durability,
    ...(process.argv.includes("--retry-incomplete")
      ? { resume: "retry-incomplete" as const }
      : {}),
  },
});
console.log(result.status, result.winner?.branch);
```

`node durable-race.ts` démarre la compétition ou lit son résultat déjà terminé. Après les vérifications et la récupération décrites ci-dessous, `node durable-race.ts --retry-incomplete` autorise les candidats interrompus à recommencer.

Changez `version` quand vous modifiez les agents, `validate` ou `score`. Une course enregistrée dont les briefs, le budget, le fournisseur, le mode de sélection ou la `version` diffèrent est refusée : relancez-la sous un nouveau `runId`.

Une course durable exige un fournisseur capable de retrouver et d’arrêter ses sandboxes après un arrêt brutal. Docker et Podman dans leur mode monté par défaut en sont capables ; les autres fournisseurs sont refusés, sauf si vous [implémentez la récupération](../custom-sandbox-providers/).

### Récupérer après un arrêt brutal

Une course interrompue par un arrêt brutal reste détenue par son coordinateur, le processus qui a lancé `speculate()`. Libérez-la avant de la rejouer.

1. Arrêtez l’ancien coordinateur et confirmez sa fin ; un délai dépassé ou un PID absent ne suffit pas.
2. Lisez la compétition enregistrée via le transport. Examinez les identifiants des ressources et gardez la révision actuelle.
3. Appelez `recoverSpeculation()` avec cette révision pour libérer la propriété. Une révision modifiée est refusée ; cet appel ne supprime rien.
4. Relancez la même compétition avec `durability.resume: "retry-incomplete"`. Outpost traite les sandboxes enregistrées, puis relance les candidats interrompus sur de nouvelles branches.

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport, recoverSpeculation } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const key = `speculations/${createHash("sha256").update("parser-race").digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  // Example output: {"runId":"parser-race",…}
  await recoverSpeculation({
    transporter,
    runId: "parser-race",
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

Un candidat interrompu repart comme une nouvelle tentative, sur `…/<key>/2`, depuis le commit d’origine. Son ancienne branche et son ancien worktree figurent dans `result.previousAttempts`. Les candidats validés et notés avant l’arrêt brutal gardent leurs scores enregistrés ; la sélection best attend toujours les candidats admis restants. Un arrêt brutal pendant la notation exige une nouvelle tentative explicitement autorisée.

## Reprendre après un quota

Une course durable terminée avec le statut `quota` n’est pas définitive. Rappeler `speculate()` avec la même `durability` relance uniquement les candidats arrêtés par une limite d’usage ou de débit, comme nouvelles tentatives. `result.quota.resetAt` donne l’heure de réinitialisation quand l’agent la communique ; [Pauses sur quota](../quota-pauses/) explique comment l’attendre.
