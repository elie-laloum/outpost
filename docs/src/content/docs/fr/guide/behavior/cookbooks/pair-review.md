---
title: "Codex implémente, Claude relit"
description: "Codex implémente, Claude relit — Outpost"
sidebar:
  order: 3
---

Réutilisez une sandbox entre implémentation et revue. Déclarez **OPENAI_API_KEY=** et **ANTHROPIC_API_KEY=** dans **.outpost/.env**, puis fournissez les valeurs par l’environnement. Avec l’authentification `usage`, Outpost exécute une fois `codex login --with-api-key` dans la sandbox, avec la clé sur l’entrée standard, et fournit sa clé API à Claude Code ; `"account"` copie plutôt les connexions de l’hôte (voir [Codex](../../../agents/connect-codex/) et [Claude Code](../../../agents/connect-claude/)).

```ts
import {
  agent as composeAgent,
  createSandbox,
  codexHarness,
  claudeHarness,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codexHarness({ authentication: "usage" }) }),
  branch: { mode: "named", name: "feature/parser-review" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Add parser boundary tests, run the suite and commit." },
  deadlineMs: 600_000,
});
const review = await sandbox.dispatch({
  agent: composeAgent({ harness: claudeHarness({ authentication: "usage" }) }),
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
