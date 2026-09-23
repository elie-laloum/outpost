---
title: "Récupérer une exécution échouée"
description: "Récupérer une exécution échouée — Outpost"
sidebar:
  order: 7
---

Utilisez cette recette pour préserver un travail partiel. Préparez l’[installation commune](../) et la connexion Claude. Nettoyage et collecte peuvent continuer après le délai de la demande.

```ts
import { dispatch, claude, recoveryDetails } from "@elie-laloum/outpost";

try {
  const result = await dispatch({
    agent: claude(),
    branch: { mode: "named", name: "fix/recoverable-parser" },
    brief: { text: "Fix parser errors, run tests and commit." },
    signal: AbortSignal.timeout(300_000),
  });
  console.log(result.branch, result.transcript);
} catch (error) {
  console.error(
    "Run failed:",
    error instanceof Error ? error.message : String(error),
  );
  console.error("Recovery locations:", recoveryDetails(error));
  process.exitCode = 1;
}
```

## Inspecter avant de relancer

Utilisez le chemin du workspace pour inspecter état Git et diffs, puis journal et conversation s’ils existent. Tous les échecs ne fournissent pas tous les champs : la création peut échouer avant la conversation. Conservez l’erreur initiale et le worktree retenu.

## Reprendre volontairement

Avec une conversation valide, fournissez son identifiant via **continuation: { id }** à un nouveau dispatch, ou utilisez **resume** sur un résultat réussi. Configurez de nouveau l’authentification. La transcription restaure l’historique, pas l’ancien home, les processus ou les fichiers non commités.

Conservez les commits de la branche nommée. Inspectez les worktrees avant déplacement ou suppression. Voir la [reprise](../../agents/conversations/) et les [informations de récupération](../../operations/recovery/).
