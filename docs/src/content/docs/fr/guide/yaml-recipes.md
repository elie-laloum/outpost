---
title: "Exécuter des recettes YAML"
description: "Exécuter des étapes locales de commande et d’agent depuis un fichier YAML."
---

## Déclarer les étapes

Enregistrez ce fichier sous `recipe.yaml`. Il demande à l’agent configuré `coder` de corriger le parseur, puis lance la vérification dans la même sandbox. `after` référence les clés des tâches ; les dépendances peuvent apparaître plus loin dans le fichier.

```yaml title="recipe.yaml"
version: 1
name: parser-fix
tasks:
  - key: fix
    agent: coder
    brief: Fix the parser and commit the change.
    retry: { attempts: 2 }
  - key: verify
    after: [fix]
    command:
      executable: npm
      arguments: [test]
```

Chaque étape choisit une commande ou un agent avec un brief littéral. Une commande utilise un exécutable et une liste d’arguments ; une syntaxe shell exige un exécutable shell explicite. Les étapes peuvent préciser `timeoutMs` et `retry` avec `attempts` et `delayMs`. Les commandes acceptent `executable`, `arguments`, `stdin`, `directory`, `variables` et `deadlineMs` de [Command](../../reference/command/). Résolvez les secrets en TypeScript, hors du YAML.

La version 1 accepte un document YAML 1.2, limité à 1 Mio et 1 000 tâches. Les champs inconnus, clés dupliquées, dépendances absentes, cycles, tags personnalisés et alias échouent avant l’exécution. Les chaînes restent littérales, y compris `${NAME}`. Le catalogue de recettes, la découverte distante, les inclusions et les modèles de texte restent à réaliser.

## Fournir la sandbox et les agents

Reprenez le dépôt, le fournisseur et l’agent de l’[installation](../setup/). Enregistrez ce module à côté de la recette. Sa fabrique par défaut reçoit le signal d’annulation et renvoie une sandbox ouverte et des agents nommés. La CLI possède la sandbox renvoyée ; la fabrique doit libérer ses ressources si elle échoue avant de les renvoyer.

```ts title="outpost.recipe.ts"
import { createSandbox, type RecipeBindings } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export default async function bindings(
  signal: AbortSignal,
): Promise<RecipeBindings> {
  return {
    sandbox: await createSandbox({
      repository,
      sandboxProvider,
      signal,
      logging: false,
    }),
    agents: { coder },
  };
}
```

Le module est du code exécutable de confiance. Configurez l’authentification, les variables et la politique de branche avec les API habituelles. Les répertoires des commandes sont interprétés par la sandbox. N’écrivez rien sur stdout dans la fabrique pour obtenir une sortie JSON exploitable.

## Exécuter la recette

Depuis votre projet de workflow, passez les deux chemins relativement au répertoire courant. Utilisez un module de configuration TypeScript ou JavaScript sur Node.js 24+.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.recipe.ts --json
```

La CLI valide le YAML avant de charger le module, exécute une étape à la fois, puis ferme la sandbox. Une sortie de commande non nulle fait échouer sa tâche et arrête le travail dépendant. Un échec ou une annulation conserve le workspace avec `close({ preserve: true })` ; la fermeture après succès suit la politique de branche configurée. SIGINT/SIGTERM annulent la préparation ou le workflow et attendent la libération. Voir [les commandes CLI](../cli/#outpost-recipe-run) pour les options et rapports.

## Utiliser le moteur en TypeScript

`defineRecipe()` renvoie un [Workflow](../../reference/type-workflow/) normal sans l’exécuter. Enregistrez ce script sous `run-recipe.ts`, puis lancez `node run-recipe.ts`. Ici, vous possédez la sandbox et `await using` la ferme. Les résultats et l’usage suivent les contrats existants des workflows.

```ts title="run-recipe.ts"
import { readFile } from "node:fs/promises";
import { createSandbox, defineRecipe } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const source = await readFile(
  new URL("./recipe.yaml", import.meta.url),
  "utf8",
);
const workflow = defineRecipe(source, { sandbox, agents: { coder } });
const result = await workflow.start();
result.unwrap();
```

Les recettes exigent une concurrence de 1 car leurs tâches partagent une sandbox. Les étapes d’agent renvoient des résultats de dispatch qui ne peuvent pas être persistés comme checkpoints JSON sans perte. Utilisez les [workflows typés](../typed-workflows/) pour les projections JSON, les étapes d’approbation, les requêtes calculées et les runs d’agent durables. Le test exécutable hors ligne est `examples/64-yaml-recipes/index.ts` dans le dépôt : construisez Outpost, puis lancez `node --test examples/64-yaml-recipes/index.ts`. Il utilise des agents scriptés, des commandes simulées et des commits Git réels ; les agents payants et le cloud restent non validés.

API : [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/).
