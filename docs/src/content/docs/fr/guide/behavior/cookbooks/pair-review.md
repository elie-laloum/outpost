---
title: "Codex implémente, Claude relit"
description: "Codex implémente, Claude relit — Outpost"
sidebar:
  order: 3
---

Réutilisez une sandbox entre implémentation et revue. Déclarez **OPENAI_API_KEY=** et un identifiant Claude dans **.outpost/.env**, puis fournissez les valeurs par l’environnement. Codex utilise ici une clé API ; le [hook de copie du compte](../../../agents/connect-codex/) est une alternative.

```ts
import { createSandbox, codex, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  branch: { mode: "named", name: "feature/parser-review" },
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'test -n "$OPENAI_API_KEY" && printenv OPENAI_API_KEY | codex login --with-api-key && npm ci',
        ],
        deadlineMs: 180_000,
      },
    ],
  },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Add parser boundary tests, run the suite and commit." },
  deadlineMs: 600_000,
});
const review = await sandbox.dispatch({
  agent: claude(),
  brief: {
    text:
      "Review the diff against " +
      sandbox.workspace.baseline +
      ". Do not edit. List defects with file paths and missing test cases.",
  },
  deadlineMs: 300_000,
});
console.log(implementation.commits, review.text);
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status !== 0) throw new Error(tests.stderr || tests.stdout);
```

## Passage entre agents

Les agents voient les mêmes fichiers et l’historique Git, mais possèdent des conversations distinctes. Donnez explicitement la base du diff. Le second agent n’hérite pas de la conversation cachée du premier. Les opérations sont séquentielles.

## Relire avant livraison

La commande de test fournit un véritable code de sortie. La revue est consultative ; rien n’est fusionné automatiquement. Inspectez la branche ou utilisez les [contrôles de livraison](../../../cookbook/delivery-gate/). La sandbox se ferme à la sortie du bloc, même si un test échoue.
