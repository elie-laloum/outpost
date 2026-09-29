---
title: "Outils"
description: "Exposer au modèle un ensemble borné d’opérations de sandbox."
---

Pour la boucle de modèle intégrée, passez les outils à `createHarness({ tools })`. Les ensembles intégrés couvrent fichiers, recherche, édition, Git et commandes shell.

## Définir un outil

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";

const gitStatus = defineHarnessTool({
  name: "git_status",
  description: "Read the working tree status.",
  input: { type: "object", properties: {}, additionalProperties: false },
  readOnly: true,
  async execute(_input, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "git",
      arguments: ["status", "--short"],
      signal,
    });
    return {
      content: result.stdout || result.stderr,
      isError: result.status !== 0,
    };
  },
});
```

`input` accepte JSON Schema ou un Standard Schema compatible avec prise en charge de JSON Schema. La validation précède `execute`. Les noms d’outils doivent être uniques, y compris dans les ensembles imbriqués et skills.

## Composer les outils

`defineHarnessToolset({ name, tools })` regroupe des outils réutilisables. `createHarnessFileTools()`, `createHarnessSearchTools()`, `createHarnessEditTools()`, `createHarnessGitTools()` et `createHarnessShellTools()` proposent des ensembles prêts à l’emploi. Fournissez uniquement les capacités nécessaires à la tâche.

`readOnly` est une métadonnée d’ordonnancement, pas une isolation. Déclarez `resources(input)` si les règles de permissions doivent inspecter les chemins ou commandes. Utilisez `context.sandbox` pour l’exécution et respectez `context.signal` ; des appels au système de fichiers hôte contourneraient la sandbox empruntée.

Pour utiliser les outils d’un serveur existant, déclarez des [serveurs MCP](../mcp-servers/) avec `createHarness({ mcpServers })`.

API : [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/).
