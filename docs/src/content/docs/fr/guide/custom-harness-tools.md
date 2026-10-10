---
title: "Créer un outil pour votre agent"
description: "Exposez une opération de sandbox au modèle, puis reliez-la au harness."
---

Partez de [Donner des outils au modèle](../harness-tools/) et de sa configuration. Exposez une opération de sandbox au modèle, puis reliez-la au harness.

<!-- example:include harness-tools read-model.ts -->

## Définir un outil

Cet outil propose au modèle de lancer les tests dans la sandbox. Le modèle peut demander tous les tests ou limiter l’exécution à un nom.

<!-- tabs -->

```ts title="test-input.ts"
import { z } from "zod";

export const testInput = z.object({ match: z.string().optional() });
export type TestInput = z.infer<typeof testInput>;
```

```ts title="execute-tests.ts"
import type { TestInput } from "./test-input.ts";
import type { HarnessToolContext } from "@elie-laloum/outpost";

export async function executeTests(
  { match }: TestInput,
  { sandbox, signal }: HarnessToolContext,
) {
  const result = await sandbox.invoke({
    executable: "npm",
    arguments: [
      "test",
      ...(match ? ["--", `--test-name-pattern=${match}`] : []),
    ],
    signal,
  });
  return {
    content: result.stdout + result.stderr,
    isError: result.status !== 0,
  };
}
```

```ts title="run-tests.ts"
import { defineHarnessTool } from "@elie-laloum/outpost";
import { testInput } from "./test-input.ts";
import { executeTests } from "./execute-tests.ts";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: testInput,
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  execute: executeTests,
});
```

Référence API : [HarnessToolOptions](../../reference/harnesstooloptions/), [HarnessToolContext](../../reference/harnesstoolcontext/) et [ToolOutput](../../reference/tooloutput/).

Un nom d’outil compte de 1 à 64 lettres, chiffres, `_` ou `-`. Une erreur levée renvoie son message au modèle, sauf si `toolExecution.onError` vaut `"fail"` (voir [Harness intégré](../harness/)).

## Regrouper des outils

`defineHarnessToolset()` réunit des outils et d’autres ensembles sous un même nom, pour les partager entre plusieurs harness.

<!-- tabs -->

```ts title="inspect-tools.ts"
import {
  defineHarnessToolset,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});
```

```ts title="coding-tools.ts"
import {
  defineHarnessToolset,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { inspect } from "./inspect-tools.ts";

export const coding = defineHarnessToolset({
  name: "coding",
  tools: [inspect, createHarnessEditTools(), createHarnessShellTools()],
});
```

Chaque nom d’outil doit être unique dans le harness : ses outils, ses ensembles imbriqués et les outils de ses [compétences](../harness-context/). Un doublon échoue dès la création du harness.

## Essayer l’outil

Reprenez `read-model.ts` depuis [les outils intégrés](../harness-tools/) et la configuration d’[Installation](../setup/). Installez `zod`. Le dépôt doit avoir un `npm test` fonctionnel ; configurez le modèle et sa clé comme sur la page du harness. Enregistrez ce fichier puis lancez `node test-agent.ts`.

```ts title="test-agent.ts"
import { createAgent, createHarness, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { modelProvider } from "./read-model.ts";
import { runTests } from "./run-tests.ts";

const agent = createAgent({
  model: "claude-sonnet-5-5",
  harness: createHarness({ modelProvider, tools: [runTests] }),
});
const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  brief: { text: "Call run_tests and report its result." },
});
console.log(result.text);
```

L’agent peut appeler `run_tests` et reçoit stdout, stderr et le verdict de la commande. Son texte final n’est pas un contrôle imposé : utilisez une [tâche de commande](../verification-loops/) si la réussite des tests doit conditionner la suite. Le code `execute` tourne sur l’hôte ; seul `context.sandbox` exécute la commande dans la sandbox.
