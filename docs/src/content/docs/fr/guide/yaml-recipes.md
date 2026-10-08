---
title: "Exécuter des recettes YAML"
description: "Créer, valider et partager des recettes paramétrables de commandes et d’agents."
---

## Créer une recette

Utilisez une recette pour exécuter la même séquence avec différents paramètres ou dans plusieurs dépôts. Conservez le YAML dans Git et laissez chaque utilisateur choisir sa sandbox et ses agents. Depuis un projet avec Outpost installé, créez un modèle sans écraser les fichiers existants :

```sh
npx outpost recipe init --file recipe.yaml --config outpost.yaml
npx outpost recipe validate --file recipe.yaml --json
```

Le modèle référence le fichier installé `@elie-laloum/outpost/recipe.schema.json` pour la complétion dans l’éditeur. `validate` vérifie le format, le graphe et les références sans importer la configuration ni allouer de sandbox. Son rapport liste les paramètres et les noms d’agents nécessaires ; il n’exécute aucune commande et ne vérifie pas les outils installés. Les erreurs de validation indiquent une position dans le fichier lorsqu’elle est disponible.

## Déclarer les paramètres et les étapes

Cette recette de version 2 reçoit une demande de modification. Les paramètres sans valeur par défaut sont obligatoires. Les nombres et booléens gardent leur type pendant la validation, puis deviennent du texte dans un brief ou un argument de commande. Un `enum` optionnel restreint les valeurs acceptées. `recipeVersion` identifie la révision de votre recette ; `version` sélectionne le format de recette Outpost.

```yaml title="recipe.yaml"
version: 2
name: fix-and-check
description: Implement a requested change and run the tests.
recipeVersion: "1.0.0"
inputs:
  goal:
    type: string
    description: The change to implement.
  runner:
    type: string
    description: The package manager used for tests.
    default: npm
    enum: [npm, bun]
```

Ajoutez ces tâches dans le même fichier. `after` référence les clés des tâches, y compris celles déclarées plus loin. Les deux étapes partagent une sandbox ; une commande en échec bloque les tâches dépendantes. Les retries et délais du moteur de workflows restent disponibles.

```yaml title="recipe.yaml — tasks"
tasks:
  - key: fix
    agent: coder
    brief: "Implement and commit: {{ inputs.goal }}"
    retry: { attempts: 2 }
  - key: verify
    after: [fix]
    command:
      executable: "{{ inputs.runner }}"
      arguments: [test]
```

La version 1 reste littérale, y compris `${NAME}` et les doubles accolades. La version 2 développe uniquement les références explicites `{{ inputs.name }}` et `{{ steps.key.field }}` dans les briefs et les chaînes des commandes. Les références inconnues échouent à la validation. La substitution ne passe qu’une fois ; une valeur ne peut pas introduire de nouvelles références. Les exécutables et tableaux d’arguments sont transmis directement. Un shell choisi explicitement interprète toujours ses arguments comme du code : transmettez les entrées non fiables par arguments ou stdin plutôt que dans le programme shell. Résolvez les secrets dans la configuration locale, hors des paramètres YAML.

## Réutiliser le résultat d’une étape

Un agent expose `text` ; une commande expose `stdout`, `stderr` et le nombre `status`. Ajoutez chaque étape référencée à `after`, même si une autre dépendance la suit déjà. Cette revue reçoit le résumé de l’implémentation après la réussite des vérifications :

```yaml title="recipe.yaml — append to tasks"
- key: review
  after: [fix, verify]
  agent: reviewer
  brief: "Review the committed change. Summary: {{ steps.fix.text }}"
```

Le moteur transmet le résultat réel à l’étape suivante. Les rapports CLI limitent chaque champ textuel retourné à 16 384 caractères avec un marqueur de troncature explicite. Les références transmettent des données, sans continuer une conversation ; les fichiers restent partagés dans le workspace de la sandbox.

## Configurer l’exécution une fois

Gardez les choix d’exécution dans un fichier `outpost.yaml` séparé et obligatoire. Réutilisez-le entre recettes communautaires sans modifier leur YAML. Les chemins du dépôt et des fichiers de session se résolvent depuis cette configuration, indépendamment du dossier courant. Construisez d’abord l’image des agents avec la [configuration initiale](../setup/).

```yaml title="outpost.yaml"
version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:latest
branch:
  mode: integrate
agents:
  coder:
    harness: codex
    authentication: account
  reviewer:
    harness: codex
    authentication: account
```

Sélectionnez Docker, Podman, `local` explicitement non isolé, Vercel ou Daytona avec `sandbox.provider`. Le choix d’image concerne Docker, Podman et Daytona ; les options CPU et mémoire concernent Docker et Podman. Les champs non pris en charge sont refusés explicitement. Les intégrations cloud exigent leurs SDK optionnels et l’authentification du fournisseur sur l’hôte. Le fichier inclus `recipe-configuration.schema.json` fournit la complétion dans l’éditeur. La CLI vérifie les agents requis avant d’ouvrir la sandbox.

Les noms de harness proviennent du catalogue des agents CLI intégrés. Chaque agent exige une authentification explicite ; consultez [l’authentification](../authentication/) pour les comportements compte et clé API. Le modèle optionnel est un nom ou un objet avec `name`, `reasoning` et `maxOutputTokens`, validé par ce harness. L’authentification accepte `account`, `usage`, un `file` ou une `variable` de compte, ou une `variable` d’usage ; les clés secrètes littérales sont refusées. Seuls les noms déclarés dans `environment` sont copiés depuis l’hôte vers les variables du fournisseur ; la validation avec `--config` ne résout pas leurs valeurs.

```yaml title="outpost.yaml — sélection optionnelle de variables"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

La CLI possède l’allocation, l’intégration et le nettoyage. L’intégration est la politique de branche par défaut de la configuration YAML ; choisissez explicitement `current` ou une branche `named` si nécessaire. Les valeurs de configuration restent littérales. Les modules TypeScript/JavaScript `RecipeConfiguration` et factories `(signal: AbortSignal) => RecipeBindings` restent compatibles pour les intégrations personnalisées. Les factories retournent une sandbox déjà ouverte : leurs rôles d’agents ne peuvent être vérifiés qu’après allocation, et elles possèdent le nettoyage si elles échouent avant de retourner.

## Exécuter et inspecter le résultat

Transmettez les paramètres avec des options `--input name=value` répétées. Les chaînes restent littérales ; les nombres et booléens utilisent la syntaxe scalaire JSON. Les paramètres inconnus, dupliqués, absents ou mal typés échouent avant le chargement de la configuration. Les deux chemins sont relatifs au dossier courant ; les dossiers des commandes sont interprétés dans la sandbox.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'goal=Handle empty parser input' --input runner=npm --json
```

La CLI attend l’intégration et le nettoyage avant de publier son rapport final. Une exécution réussie appelle l’intégration du workspace selon la politique de branche configurée. Un échec ou une annulation préserve le workspace. `status` inclut les échecs de finalisation ; `workflowStatus` décrit les tâches séparément. Les rapports comprennent les sorties bornées des tâches, les diagnostics des commandes, la consommation et l’emplacement du workspace. SIGINT/SIGTERM annulent la préparation ou l’exécution et attendent le nettoyage. Consultez les [commandes CLI](../cli/#outpost-recipe-run) pour les options et codes de sortie.

## Utiliser le moteur en TypeScript

`defineRecipe()` emprunte la sandbox et retourne un [Workflow](../../reference/type-workflow/). Ici, l’appelant possède l’intégration, la préservation et le nettoyage ; le moteur exécute seulement les tâches. Transmettez des valeurs typées dans `inputs` et inspectez les résultats avec l’API habituelle des workflows.

```ts title="run-recipe.ts"
import { readFile } from "node:fs/promises";
import { createSandbox, defineRecipe } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

const sandbox = await createSandbox({ repository, sandboxProvider });
try {
  const source = await readFile(
    new URL("./recipe.yaml", import.meta.url),
    "utf8",
  );
  const workflow = defineRecipe(source, {
    sandbox,
    agents: { coder, reviewer: coder },
    inputs: { goal: "Handle empty parser input" },
  });
  (await workflow.start()).unwrap();
  await sandbox.workspace.integrate();
} finally {
  await sandbox.close({ preserve: true });
}
```

Les recettes exigent une concurrence de 1. Les résultats d’agents ne peuvent pas être stockés en checkpoints JSON sans perte ; utilisez les [workflows typés](../typed-workflows/) pour les exécutions durables, les gates et les projections personnalisées. Les deux formats acceptent un document YAML 1.2 de 1 Mio et 1 000 tâches au maximum ; champs inconnus, clés dupliquées, alias, tags personnalisés, dépendances absentes et cycles sont refusés.

## Trouver et télécharger des recettes

Le paquet inclut le catalogue officiel versionné dans Git : `fix-and-check`, `review` et `update-docs`. Listez-le et copiez une recette dans votre projet. Le téléchargement n’exécute aucun code et n’écrase aucun fichier existant. Gardez la configuration locale séparée et associez les rôles d’agents requis avant l’exécution.

```sh
npx outpost recipe list
npx outpost recipe fetch --recipe review --file review.yaml
npx outpost recipe validate --file review.yaml --config outpost.yaml
npx outpost recipe run --file review.yaml --config outpost.yaml \
  --input 'focus=Error handling' --json
```

Passez `--catalog` avec un chemin JSON local ou une URL HTTPS pour utiliser un catalogue tiers. Les chemins de recettes distantes relatifs se résolvent depuis l’URL finale du catalogue après redirections, et chaque téléchargement distant doit rester en HTTPS. Les transferts sont limités à 1 Mio et 15 secondes. Le téléchargement vérifie SHA-256, valide la recette et contrôle son nom et sa révision avant d’écrire. L’empreinte vérifie les octets par rapport au catalogue sélectionné ; choisissez un éditeur de confiance et examinez les recettes avant de les exécuter avec vos identifiants.

## Contribuer et tester une recette

Ajoutez un fichier YAML de version 2 sous `recipes/`, avec un nom identique au nom du fichier, une description, une révision de recette et des paramètres documentés. Gardez sandbox, modèles et authentification dans le YAML séparé de l’utilisateur. Mettez à jour le catalogue depuis ces déclarations, ajoutez un test hors ligne, puis proposez la modification Git. La CI refuse les empreintes périmées.

```sh
node scripts/recipe-catalog.mjs --write
node scripts/recipe-catalog.mjs
bun run build
node --test examples/64-yaml-recipes/index.ts
```

Les catalogues tiers utilisent le JSON `{ "version": 1, "recipes": [...] }`. Chaque entrée déclare `name`, `version`, `description`, `source` et un `sha256` en minuscules. Les chemins sources peuvent être relatifs au catalogue ; les catalogues distants ne peuvent référencer que des ressources HTTPS. Version du catalogue, révision de recette et version du format ont des sens distincts.

Utilisez les [tests de workflows](../testing-workflows/) pour tester sans compte payant. `examples/64-yaml-recipes/` fournit une configuration YAML de production et une fixture TypeScript séparée avec agents scriptés, commande simulée et vrais commits Git. Son commentaire de deux lignes dans index explique l’exécution et l’exemple tourne en CI. Les tests fonctionnels exécutent aussi une recette inchangée avec une configuration YAML sur deux vrais dépôts et vérifient arguments, intégration et rapports d’échec. Les tests de téléchargement simulent les réponses HTTP ; les serveurs de catalogue réels, appels d’agents et exécutions cloud restent non validés.

API : [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/) · [RecipeConfiguration](../../reference/recipeconfiguration/).
