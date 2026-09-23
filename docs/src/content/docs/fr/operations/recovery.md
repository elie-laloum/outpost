---
title: "Erreurs et récupération"
description: "Erreurs et récupération — Outpost"
sidebar:
  order: 1
---

Examinez l’erreur originale et ses informations de récupération avant de supprimer un workspace ou de répéter une opération avec effets de bord.

```ts
import {
  dispatch,
  codex,
  OutpostError,
  recoveryDetails,
} from "@elie-laloum/outpost";

try {
  await dispatch({
    agent: codex(),
    brief: { text: "Implémente et teste la correction." },
  });
} catch (error) {
  if (error instanceof OutpostError) console.error(error.code, error.details);
  console.error(recoveryDetails(error));
  throw error;
}
```

`OutpostError` contient `code`, `details` figé, `recovery` et éventuellement `cause`. Les codes sont `configuration`, `process`, `timeout`, `aborted`, `workspace`, `conflict`, `prompt`, `response`, `session` et `provider`. Plusieurs échecs peuvent former un `AggregateError`. Une annulation peut conserver une erreur native ; utilisez `recoveryDetails` sans supposer que toute erreur est un OutpostError.

## Éléments conservés

La récupération peut inclure workspace, conversation, commits, transcript et log selon l’étape atteinte. Les worktrees modifiés sont conservés ; les workspaces propres possédés sont supprimés après un échec au démarrage. Les branches nommées survivent à la suppression d’un worktree propre.

Les dossiers distants peuvent contenir `initial.bundle`/`commits.bundle`, patches binaires, `previous-index.patch`, fichiers non suivis dans `incoming`/`previous-files` et `state.json`. Ils représentent les états précédent et entrant, sans garantir qu’un transfert interrompu est complet.

## Procédure de récupération

1. Notez erreur, chemins et branches ; conservez le dossier de récupération.
2. Examinez l’état et l’historique Git du worktree retenu.
3. Inspectez bundles et patches dans un clone séparé avant toute application à un travail important.
4. Résolvez chevauchements ou conflits, puis reprenez avec branche et conversation explicites si nécessaire.

Ne relancez pas aveuglément une campagne après un échec de fermeture du tracker : les commits peuvent déjà être intégrés. Réconciliez d’abord les issues. Ne supprimez jamais un verrou actif pour contourner les règles de propriété.
