---
title: "Inclure la sortie d’une commande dans un brief"
description: "Exécutez des commandes de préparation fiables lors du rendu du prompt."
---

Partez de [briefs](../briefs/) et de sa configuration. Exécutez des commandes de préparation fiables lors du rendu du prompt.

## Insérer la sortie d’une commande

Écrivez `` !`command` `` pour remplacer le fragment par ce qu’affiche la commande. Servez-vous-en pour transmettre à l’agent le journal d’un test en échec ou l’historique récent.

```md title="fix-test.md"
Fix the failing test in {{TEST_FILE}}. Its current output:

!`npx vitest run {{TEST_FILE}} 2>&1 | tail -n 40`

Recent commits:

!`git log --oneline -5`
```

Les commandes s’exécutent dans la sandbox, dans la copie de travail de l’agent, avec `sh -c`. Avant chaque passe, toutes les commandes du brief tournent en parallèle.

<!-- features -->

- **Sortie** : Seule la sortie standard est insérée ; ajoutez `2>&1` pour inclure les erreurs.
- **Échec** : Un code de sortie non nul fait échouer la tâche avec le code `prompt` et arrête les autres commandes.
- **Délai** : `expansionMs` borne chaque commande ; la valeur par défaut est de 30 secondes.

```ts
import { fileURLToPath } from "node:url";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  expansionMs: 60_000,
  brief: {
    file: fileURLToPath(new URL("fix-test.md", import.meta.url)),
    values: { TEST_FILE: "test/signup.test.ts" },
  },
});
```

:::caution
Les commandes exécutent du code. Gardez la maîtrise des fichiers de modèle et ne passez à une commande que des `values` de confiance : elles sont insérées sans échappement.
:::

Les valeurs ne peuvent pas ajouter de commandes : Outpost repère les fragments `` !` `` dans le fichier avant de remplir les emplacements.
