---
title: "Backlogs GitHub, Beads et personnalisés"
description: "Backlogs GitHub, Beads et personnalisés — Outpost"
sidebar:
  order: 5
---

`Backlog` est le port du tracker : `list(signal)`, `get(id, signal)` et `close(id, signal)`. Les issues contiennent `id`, `title`, éventuellement `body` et des identifiants `blockedBy`. Une campagne exclut les issues dont les dépendances restent ouvertes.

## Connecteurs intégrés

`githubBacklog({ directory, label, deadlineMs })` utilise `gh` authentifié sur l’hôte, parcourt toutes les pages et exclut les pull requests. `label` filtre la file. Déclarez `GH_TOKEN` dans `.outpost/.env` ou authentifiez le CLI hôte. L’initialisation avec `--tracker github --label NAME` crée ou met à jour ce label.

`beadsBacklog({ directory, label, deadlineMs })` utilise `bd ready --json --limit 0`, `bd show` et `bd close` sur l’hôte. Installez et initialisez d’abord [Beads](https://github.com/gastownhall/beads). Sa sélection ajoute aussi son CLI épinglé à l’image générée. Les deux connecteurs reçoivent les variables déclarées du projet.

## Implémenter un backlog

```ts
import type { Backlog, Issue } from "@elie-laloum/outpost";

const issues = new Map<string, Issue>([
  [
    "validation",
    { id: "validation", title: "Ajouter des tests de validation" },
  ],
]);
const backlog: Backlog = {
  async list(signal) {
    signal?.throwIfAborted();
    return [...issues.values()];
  },
  async get(id, signal) {
    signal?.throwIfAborted();
    const issue = issues.get(id);
    if (!issue) throw new Error(`Unknown issue: ${id}`);
    return issue;
  },
  async close(id, signal) {
    signal?.throwIfAborted();
    issues.delete(id);
  },
};
console.log(await backlog.list());
```

Gardez les mutations du tracker sur l’hôte. Les agents ne doivent pas fermer les issues avant la réussite de l’intégration. Rendez la fermeture répétable sans effet indésirable lorsque possible.

Le starter `custom` utilise GET `issues?state=open`, GET `issues/:id` et POST `issues/:id/close` sur `OUTPOST_TRACKER_URL`. Adaptez authentification, pagination et lecture des réponses dans `tickets.ts`/`tickets.mts` ; `.outpost/TRACKER.md` décrit ce contrat de départ.
