---
title: "Donner des instructions et des compétences au harness"
description: "Charger les consignes du projet et proposer des compétences au modèle."
---

Les instructions donnent les consignes communes à chaque échange. Les compétences ajoutent des consignes que le modèle peut charger pour une tâche particulière. Partez d’un [harness fonctionnel](../harness/). Pour imposer une restriction, configurez les [permissions des outils](../harness-permissions/).

## Écrire les instructions système

Référence API : [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) et [HarnessSkillOptions](../../reference/harnessskilloptions/).

Lisez le fichier `AGENTS.md` du projet dans la sandbox empruntée pour construire les instructions système. Cet exemple utilise son contenu si la lecture réussit et renvoie une chaîne vide dans le cas contraire.

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";

export const projectGuidance = defineHarnessInstructions(
  async ({ sandbox, signal }) => {
    const result = await sandbox.invoke({
      executable: "cat",
      arguments: ["AGENTS.md"],
      signal,
    });
    return result.status === 0 ? result.stdout : "";
  },
);
```

Passez `instructions: ["Answer with evidence.", projectGuidance]`. Le résolveur reçoit la `sandbox` empruntée, le `signal`, le `model` et, quand le harness déclare des [serveurs MCP](../mcp-servers/), un accès `mcp` à leurs prompts.

## Charger des compétences à la demande

Une compétence regroupe des consignes et des outils que le modèle ne charge que lorsqu’il en a besoin. Ses instructions restent hors du prompt système jusque-là.

```ts
import {
  createHarnessGitTools,
  defineHarnessSkill,
} from "@elie-laloum/outpost";

export const review = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
console.log(
  review.name,
  review.tools.map((tool) => tool.name),
);
// Example output: review [ 'git' ]
```

<!-- check:run -->

Le script affiche `review [ 'git' ]` : le nom de la compétence et les outils qu’elle rend disponibles. Ajoutez-la au harness avec `createHarness({ skills: [review] })`.

1. Le modèle voit le nom et la description des skills disponibles.
2. Il appelle `load_skill` pour lire les instructions d’un skill et rendre ses outils accessibles.
3. Il suit ces instructions et peut utiliser les outils jusqu’à la fin de la conversation.

Appeler un outil avant de charger son skill renvoie une erreur.

Référence API : [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) et [HarnessSkillOptions](../../reference/harnessskilloptions/).

:::caution
Une compétence donne des consignes au modèle ; elle ne les fait pas respecter par le moteur. Pour bloquer un outil, utilisez les [permissions](../harness-permissions/) ; pour exiger une décision avant de continuer, utilisez les [approbations](../approvals/).
:::

## Garder les limites visibles

- Une réduction de l’historique qui supprime l’appel à `load_skill` reverrouille les outils de la compétence jusqu’à ce que le modèle la recharge.

- Les définitions des outils sont envoyées à chaque requête, même si leurs compétences ne sont pas encore chargées. Le chargement à la demande réduit le texte des instructions, mais pas les schémas d’outils.

[La gestion de l’historique](../harness-context/) explique la compaction.
