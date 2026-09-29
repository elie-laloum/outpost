---
title: "Journaux"
description: "Conserver un enregistrement durable de chaque dispatch et le relire."
---

Utilisez les journaux de requête pour conserver les traces d’exécution, les observateurs pour l’affichage en direct et la télémétrie pour l’instrumentation.

```ts
import {
  dispatch,
  createLocalTransport,
  readJournal,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  console.log(
    await readJournal({ transporter, reference: result.logReference }),
  );
}
```

## Options du journal

`logging: false` désactive le journal. `"stdout"` choisit la sortie standard. Un objet sélectionne un transport, éventuellement `verbose` pour conserver les événements bruts et `replayable` pour enregistrer les commits à [rejouer](../record-replay/). Le `logReference` renvoyé fixe la révision de l’index ; `readJournal()` vérifie les segments liés et renvoie les événements persistés dans l’ordre.

Un journal ouvert expose son préfixe persisté. `maxEntries` et `maxBytes` bornent les lectures. Journaux et transcriptions peuvent contenir des données privées du dépôt : maîtrisez leur stockage et leur partage.
