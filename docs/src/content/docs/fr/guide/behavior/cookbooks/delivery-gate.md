---
title: "Tester et relire avant intégration"
description: "Tester et relire avant intégration — Outpost"
sidebar:
  order: 5
---

Cette recette autorise explicitement l’intégration dans la branche hôte après validation. Partez d’une branche attachée et propre avec l’[installation commune](../../../cookbook/). Adaptez les tests au projet.

```ts
import {
  createSandbox,
  claude,
  agentTask,
  commandTask,
  task,
  workflow,
  response,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: claude(),
  branch: { mode: "integrate" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({
    brief: { text: "Fix parser edge cases, add tests and commit." },
    deadlineMs: 600_000,
  }),
});
const verify = commandTask({
  key: "verify",
  after: [implement],
  sandbox,
  command: { executable: "npm", arguments: ["test"], deadlineMs: 180_000 },
});
const review = agentTask({
  key: "review",
  after: [verify],
  sandbox,
  request: () => ({
    brief: {
      text:
        "Review the diff against " +
        sandbox.workspace.baseline +
        '. Do not edit. Return <review>{"approved":true}</review> only without blocking defects; otherwise use false.',
    },
    deadlineMs: 300_000,
    response: response.json({
      tag: "review",
      schema(value) {
        if (
          !value ||
          typeof value !== "object" ||
          !("approved" in value) ||
          typeof value.approved !== "boolean"
        )
          throw new Error("Expected approved boolean");
        return { approved: value.approved };
      },
    }),
  }),
});
const integrate = task({
  key: "integrate",
  after: [review],
  async perform(context) {
    if (!context.value(review).value.approved)
      throw new Error("Review declined integration");
    const clean = await sandbox.command({
      executable: "git",
      arguments: ["status", "--porcelain"],
      signal: context.signal,
    });
    if (clean.status !== 0 || clean.stdout.trim())
      throw new Error("Expected committed, clean changes");
    await sandbox.workspace.integrate();
    return { integrated: true };
  },
});
const result = await workflow("validated-delivery", [
  implement,
  verify,
  review,
  integrate,
]).start({ signal: AbortSignal.timeout(1_200_000) });
result.unwrap();
console.log(result.value(integrate));
```

## Fonctionnement des contrôles

Les dépendances ordonnent le travail dans la sandbox commune. Un test en échec empêche revue et intégration. Une réponse invalide échoue au parsing ; une revue négative bloque la fusion. Aucune reprise ne répète commits ou fusions.

La réussite représente des tests réussis et une revue d’agent, pas une approbation humaine. Prévoyez une fusion contrôlée par une personne si nécessaire. Un conflit peut conserver des workspaces de récupération. L’intégration fusionne localement sans pousser.

## Étendre avec précaution

Ajoutez lint et vérification des types après implémentation. Si le relecteur peut modifier, relancez les tests après revue. Séparez les sandboxes pour le parallèle. Voir la [récupération](../../../operations/recovery/) après un contrôle échoué.
