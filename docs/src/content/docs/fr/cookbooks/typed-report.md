---
title: "Transformer une analyse en données typées"
description: "Transformer une analyse en données typées — Outpost"
sidebar:
  order: 2
---

Utilisez cette recette lorsqu’un tableau de bord ou une tâche attend des données structurées. Préparez la [connexion Claude](../../agents/connect-claude/) et l’[installation commune](../).

```ts
import { dispatch, claude, response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: claude(),
  branch: { mode: "named", name: "audit/test-readiness" },
  brief: {
    text: 'Inspect the test setup without editing files. Return <report>{"ready":true,"summary":"explanation"}</report>. Use false if prerequisites are missing.',
  },
  deadlineMs: 180_000,
  response: response.json({
    tag: "report",
    repairs: 1,
    schema(value) {
      if (
        !value ||
        typeof value !== "object" ||
        !("ready" in value) ||
        typeof value.ready !== "boolean" ||
        !("summary" in value) ||
        typeof value.summary !== "string"
      )
        throw new Error("Expected ready and summary");
      return { ready: value.ready, summary: value.summary };
    },
  }),
});
console.log(result.value.ready, result.value.summary);
```

## Limite de la validation

Le schéma valide la structure, pas la véracité. Confrontez le rapport aux fichiers ou commandes réelles. Demander de ne pas modifier ne rend pas le système de fichiers accessible uniquement en lecture.

## Réponses invalides

Un tour de réparation peut reprendre avec les erreurs de validation. Si la réparation échoue, une erreur expose les informations de récupération. Gardez une seule passe pour une réponse structurée. Voir les [réponses validées](../../agents/responses/).
