---
title: "Partager des fichiers et des rapports"
description: "Enregistrez les fichiers produits par vos tâches et transmettez leurs références entre tâches ou processus."
---

## Publier et lire un artefact

Utilisez un artefact lorsqu’une tâche produit un fichier ou un rapport à conserver séparément de son résultat. `publishArtifact()` encode et enregistre le contenu, puis renvoie une référence que `readStoredArtifact()` utilise pour le relire.

<!-- tabs -->

```ts title="coverage.ts"
import {
  defineJsonArtifact,
  createArtifactStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const coverage = defineJsonArtifact({
  name: "coverage-report",
  version: "1",
  schema: z.object({ lines: z.number(), files: z.array(z.string()) }),
});
export const store = createArtifactStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="publish.ts"
import { reportValue } from "./reporter.ts";
import { publishArtifact, readStoredArtifact } from "@elie-laloum/outpost";
import { store, coverage } from "./coverage.ts";

export const reference = await publishArtifact(
  store,
  coverage,
  { lines: 87.5, files: ["src/parser.ts"] },
  { producer: { executionId: "nightly-42", taskKey: "coverage", attempt: 1 } },
);
reportValue(await readStoredArtifact(store, coverage, reference));
// Example output: { lines: 87.5, files: [ 'src/parser.ts' ] }
```

<!-- check:run -->

Le contenu est écrit dans `.outpost/storage/artifacts/<id>.blob`. La référence est un petit objet JSON : `id`, une empreinte SHA-256 `digest`, `size`, `contract`, `producer` et `parents`. La lecture vérifie le contrat, la taille et l’empreinte avant de décoder.

## Quand utiliser un artefact

|               | Sortie de tâche                                 | Artefact                                                |
| ------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Contenu       | JSON sans perte dans une exécution à checkpoint | JSON vérifié par un schéma, ou octets                   |
| Taille        | Le checkpoint entier est plafonné à 16 Mio      | Chaque artefact jusqu’à 16 Mio par défaut (`maxBytes`)  |
| Lisible par   | Les tâches dépendantes de la même exécution     | Tout processus disposant du stockage et de la référence |
| Vérifications | Aucune validation à la lecture                  | Contrat, taille et empreinte à chaque lecture           |

Gardez les petits résultats comme sorties de tâche. Publiez un artefact pour un rapport volumineux, un fichier binaire ou un résultat lu par un autre processus : le checkpoint ne conserve alors que la référence.

## Choisir un contrat

| Contrat                                         | Valeur          | À la publication et à la lecture                                                   |
| ----------------------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `defineJsonArtifact({ name, version, schema })` | JSON sans perte | Valide avec un Standard Schema (Zod, Valibot…) ou une fonction qui lève une erreur |
| `defineBinaryArtifact({ name, version })`       | `Uint8Array`    | Copie les octets tels quels                                                        |

Changez `version` quand le format change. Un contrat dont le nom, la version ou l’encodage diffère rejette la référence avec `Artifact contract mismatch`.

## Utiliser les artefacts dans un workflow

`defineArtifactTask()` prend les options habituelles d’une tâche, plus `store`, `contract` et `produce(context)`. Sa sortie est la référence ; `readArtifact()` la lit depuis une tâche listée dans `after`.

<!-- tabs -->

```ts title="findings.ts"
import {
  defineJsonArtifact,
  createArtifactStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const findings = defineJsonArtifact({
  name: "audit-findings",
  version: "1",
  schema: z.array(z.object({ file: z.string(), issue: z.string() })),
});
export const store = createArtifactStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="audit.ts"
import { defineArtifactTask } from "@elie-laloum/outpost";
import { store, findings } from "./findings.ts";

export const audit = defineArtifactTask({
  key: "audit",
  store,
  contract: findings,
  produce: () => [{ file: "src/parser.ts", issue: "Unchecked input length" }],
});
```

```ts title="summary.ts"
import { defineTask, readArtifact } from "@elie-laloum/outpost";
import { audit } from "./audit.ts";
import { findings, store } from "./findings.ts";

export const summary = defineTask({
  key: "summary",
  after: [audit],
  perform: async (context) => {
    const items = await readArtifact(context, audit, findings, store);
    return `${items.length} finding(s) in ${items[0]?.file}`;
  },
});
```

```ts title="audit-report.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { audit } from "./audit.ts";
import { summary } from "./summary.ts";

export const result = await defineWorkflow("audit", [audit, summary]).start();
result.unwrap();
reportValue(result.value(summary));
// Example output: 1 finding(s) in src/parser.ts
```

<!-- check:run -->

La tâche renseigne `producer` à partir de l’exécution, de sa clé et de la tentative. `readArtifact()` rejette une référence produite par une autre exécution ou une autre tâche, puis vérifie et décode le contenu. Dans un vrai workflow, `produce` lit le résultat d’une tâche d’agent avec `context.value()`.

## Enregistrer la filiation

`parents` liste, dans l’ordre, les références dont un artefact est dérivé. Dans `defineArtifactTask()`, passez `parents: (context) => [context.value(audit)]`.

```ts
import { readFile } from "node:fs/promises";
import { defineBinaryArtifact, publishArtifact } from "@elie-laloum/outpost";
import type { ArtifactReference, ArtifactStore } from "@elie-laloum/outpost";

declare const store: ArtifactStore;
declare const report: ArtifactReference;

const archive = defineBinaryArtifact({ name: "coverage-html", version: "1" });
const html = await publishArtifact(
  store,
  archive,
  await readFile("coverage.tar.gz"),
  {
    producer: { executionId: "nightly-42", taskKey: "html", attempt: 1 },
    parents: [report],
  },
);
```

Le producteur et les parents font partie de la référence et de son `id`. Passez `producer` ou `parents` à `readStoredArtifact()` pour rejeter une référence qui ne leur correspond pas.

:::caution
Une empreinte détecte un contenu modifié ou incohérent ; elle ne prouve pas qui l’a publié. Quiconque peut écrire dans le stockage peut publier n’importe quel `producer`. Gardez le stockage privé et authentifiez les processus autorisés à y écrire : voir [Sécurité](../security/).
:::

## Lire un artefact depuis un autre processus

Une référence est du JSON ordinaire : enregistrez-la dans un checkpoint, un job de file d’attente ou un fichier. Un autre processus ouvre un stockage sur le même transport et la lit avec le même contrat.

```ts
import { readFile } from "node:fs/promises";
import { readStoredArtifact } from "@elie-laloum/outpost";
import type { ArtifactContract, ArtifactStore } from "@elie-laloum/outpost";

declare const store: ArtifactStore;
declare const coverage: ArtifactContract<{ lines: number }>;

const saved: unknown = JSON.parse(await readFile("coverage.json", "utf8"));
const report = await readStoredArtifact(store, coverage, saved);
```

`readStoredArtifact()` valide la référence elle-même : un `id`, un `digest` ou un `producer` modifié est rejeté.

## Stocker les artefacts à distance

`createArtifactStore({ transporter })` accepte n’importe quel Transport. Utilisez un [transport S3 ou R2](../object-storage/) pour partager les artefacts entre machines ; [Où vivent les données](../storage/) décrit l’arborescence locale.

## Limites

- Le contenu d’un artefact est chargé en mémoire à la publication et à la lecture. Pour choisir une limite de taille, consultez [ArtifactStoreOptions](../../reference/artifactstoreoptions/).
- Un artefact publié est immuable. Outpost n’en supprime jamais : faites expirer les anciens objets avec les règles de votre stockage.

API : [defineJsonArtifact](../../reference/definejsonartifact/) · [defineBinaryArtifact](../../reference/definebinaryartifact/) · [createArtifactStore](../../reference/createartifactstore/) · [publishArtifact](../../reference/publishartifact/) · [readStoredArtifact](../../reference/readstoredartifact/) · [defineArtifactTask](../../reference/defineartifacttask/) · [readArtifact](../../reference/readartifact/) · [ArtifactReference](../../reference/artifactreference/)
