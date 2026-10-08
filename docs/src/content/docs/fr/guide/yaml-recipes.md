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

Le paquet inclut le catalogue officiel versionné dans Git : `fix-and-check`, `queued-review`, `review`, `review-change`, `review-and-approve` et `update-docs`. Listez-le et copiez une recette dans votre projet. Le téléchargement n’exécute aucun code et n’écrase aucun fichier existant. Gardez la configuration locale séparée et associez les rôles d’agents requis avant l’exécution.

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

## Déclarer l’observation et les rapports finaux

La configuration version 2 peut attacher un hub à l’allocation, aux tâches, à l’activité des agents et au nettoyage. Une exécution réussie sans sortie déclarée est silencieuse. Les erreurs restent sur stderr ; `--json` sélectionne explicitement un rapport final JSON et remplace les rapports configurés pour cette invocation.

```yaml title="outpost.yaml — observation et rapports"
version: 2
repository: .
sandbox:
  provider: docker
  image: outpost:dev
observation:
  sinks:
    - type: console
      format: json
reports:
  - type: json
    stream: stdout
```

Le sink console écrit les événements sur stderr par défaut. Le rapport final paraît après nettoyage de la sandbox et des composants. Omettez `reports` pour recevoir les événements sans rendu final ; omettez `observation` pour demander seulement le rapport final. Les formats de recette 1 et 2 gardent leurs sémantiques. Le format 3 compose aussi workflows, exécutions durables, services et candidats expérimentaux avec les moteurs natifs.

## Réutiliser des objets observateurs locaux

Déclarez les extensions uniquement dans la configuration locale. Un module peut exporter un objet déjà construit, emprunté pour l’invocation, ou une factory avec un JSON Schema statique et un nettoyage explicitement nommé. La validation statique contrôle ces déclarations sans importer le module ; la validation runtime vérifie l’export réel avant allocation.

```yaml title="outpost.yaml — observateur emprunté"
extensions:
  audit:
    module: ./audit.ts
    export: sink
    kind: sink
    version: "1"
observation:
  sinks:
    - $ref: extensions.audit
```

L’export `sink` implémente `ObservationSink`. Le runtime ne ferme jamais un objet emprunté. Pour une factory, ajoutez `factory: true`, `schema`, puis éventuellement `options` et `dispose`, nommant un autre export. La factory reçoit ses options et un contexte avec annulation, dossier de configuration et résolution des composants nommés. Seuls les modules locaux et paquets déjà installés sont acceptés ; une recette téléchargée ne peut pas importer elle-même ses extensions.

Le point d’entrée `/recipes` expose `defineRecipeComponent`, `createRecipeRegistry`, `validateRecipeProject` et `createRecipeRuntime`. La construction du runtime valide sans allouer ; `run()` alloue et nettoie chaque invocation, et `close()` annule une invocation active et empêche les suivantes. `examples/65-recipe-observation/` vérifie observation et rapports déclarés sans appel de modèle.

L’inventaire `recipes/parity.json` classe exports et options publics des sept lots. Les [composants disponibles](../yaml-components/) sont générés depuis le registre ; la [composition avancée](../recipe-advanced/) explique expérimentation, intégration et limites des validations live. Fonctions d’extension et utilitaires immédiats conservent leurs contrats TypeScript.

## Composer les composants natifs de configuration

La configuration version 2 conserve les formes courtes `sandbox` et `agents`. Un provider nommé peut aussi être réutilisé par une référence `$ref` explicite. Les références nomment une famille et un composant ; noms absents, catégories incompatibles et cycles échouent avant allocation. Ajoutez ces déclarations à la configuration locale avec son dépôt obligatoire.

```yaml title="outpost.yaml — provider nommé"
sandbox:
  $ref: sandboxProviders.build
sandboxProviders:
  build:
    type: docker
    image: outpost:sandbox
    repositoryMode: isolated
    cpus: 2
    memoryMb: 4096
```

Les options des providers suivent leurs contrats TypeScript, dont les montages, caches de dépendances et restrictions réseau. Les caches cloud peuvent référencer des transports nommés. Les SDK des providers ne sont chargés que lorsqu’ils sont utilisés. Firecracker reste expérimental et exige `experimental: true` ; sa déclaration ne valide pas la préparation de l’hôte. Consultez [le choix de sandbox](../choose-a-sandbox/) et l’API du provider pour les options prises en charge et les limites de validation réelle.

Placez préparation, guards de diff, délais d’étapes, copies, journalisation et réglages de stockage sous `workspace`. Gardez dépôt, branche, provider et observation à la racine de la configuration. Les chemins hôte sont résolus depuis le dossier du fichier ; les chemins internes à la sandbox conservent la sémantique du provider. `examples/66-recipe-components/` exécute préparation et commande sur des ressources Git locales temporaires.

```yaml title="outpost.yaml — préparation du workspace"
workspace:
  guard:
    protectedPaths: [".github/**"]
  hooks:
    sandboxReady:
      - executable: npm
        arguments: [ci]
        when:
          kind: changed
          files: [package-lock.json]
```

Les profils portables et tous les réglages des harness CLI utilisent les mêmes factories que TypeScript. Déclarez un profil puis référencez-le depuis un rôle d’agent ; les déclarations MCP et l’authentification explicite conservent leurs contrôles de capacités. Le provider local reste non isolé. Les fichiers de compte sont résolus sur l’hôte et restent séparés du stockage des conversations.

```yaml title="outpost.yaml — profil partagé"
profiles:
  reviewer:
    type: portable
    instructions: Review the change without editing files.
    allowedTools: [read]
agents:
  reviewer:
    harness: claude
    authentication: account
    profile:
      $ref: profiles.reviewer
```

## Sélectionner les secrets avant allocation

Une valeur d’environnement peut utiliser `{ env: VARIABLE_NAME }`. Les composants de gestion de secrets reprennent leurs options publiques ; les clients SDK installés sont des extensions `object` empruntées. Le token Vault ci-dessous est ainsi lu sur l’hôte uniquement à l’exécution. Les sources natives sont déclarées sous `secrets` ; `variables.secrets` sélectionne des noms explicites avec `fromSecrets()`.

```yaml title="outpost.yaml — source de secrets sur l’hôte"
secrets:
  build:
    type: vault
    address: https://vault.example.com
    token: { env: VAULT_TOKEN }
    mount: secret
    path: build
variables:
  selected:
    type: secrets
    source: { $ref: secrets.build }
    names: [BUILD_TOKEN]
sandbox:
  provider: docker
  image: outpost:sandbox
  variables: { $ref: variables.selected }
```

Seules les valeurs sélectionnées atteignent la sandbox. La validation n’importe aucun module utilisateur et ne lit aucune valeur de secret. Une valeur absente échoue avant allocation ; le runtime masque les valeurs sélectionnées dans les observations, les rapports retournés et les diagnostics d’exécution. Il ne modifie pas l’environnement hôte. Consultez [les sources de secrets](../secret-sources/) pour les restrictions des services et la propriété des identifiants.

Les schémas statiques sont générés depuis les types TypeScript publics installés et vérifiés en CI. Le lifecycle local, le chargement d’extensions, la sélection de secrets et l’équivalence des requêtes CLI disposent de régressions hors ligne. Ces tests n’exercent pas les vrais providers cloud, services de secrets ou agents payants.

## Exécuter le harness Outpost depuis le YAML

Le harness `outpost` accepte outils, permissions, stratégies de contexte, hooks, skills, routage et conversations nommés ou déclarés directement. Déclarez un fournisseur de modèles sous `models`, puis référencez le harness depuis le rôle d’agent de la recette. L’exécution utilise la boucle TypeScript existante, ses permissions et ses budgets cumulatifs de sous-agents.

```yaml title="outpost.yaml — harness intégré"
models:
  coding:
    type: openai
    api: responses
    baseUrl: https://api.openai.com/v1
    apiKey: { env: OPENAI_API_KEY }
harnesses:
  coding:
    type: outpost
    modelProvider: { $ref: models.coding }
    tools:
      - type: files
      - type: edit
agents:
  coder:
    harness: { $ref: harnesses.coding }
    model: your-model-name
```

Sélectionnez un modèle pris en charge par votre fournisseur avant exécution ; cette configuration utilise la facturation par clé API. Consultez [le harness Outpost](../harness/) pour son comportement et [les fournisseurs de modèles](../model-providers/) pour la connexion. `examples/67-recipe-harness/` remplace le service par une fixture HTTP locale et fonctionne sans identifiants ni appel payant.

Les étapes agent du format 3 acceptent les options `dispatch`. Un contrat de réponse nommé fournit la validation JSON Schema et les instructions finales existantes. Les références de composants du dispatch nécessitent le runtime à deux fichiers ; les bindings historiques de `defineRecipe` continuent de servir les recettes commande et agent sur sandbox empruntée.

```yaml title="recipe.yaml — résultat structuré"
version: 3
name: structured-review
tasks:
  - key: review
    agent: reviewer
    brief: Review the change.
    dispatch:
      response: { $ref: responses.verdict }
```

Déclarez `responses.verdict` dans la configuration locale avec `type: json`, un `tag` et `jsonSchema`. L’option `repairs` utilise la boucle de réparation existante. Pour une validation personnalisée, `schema` référence un objet validateur ou une extension callback. Les réponses natives `text`, agents de secours et composants de conversations conservent leurs contrats TypeScript.

## Brancher des callbacks typés locaux

Les callbacks restent dans des modules locaux sélectionnés par la configuration. Leur `contract` statique nomme l’option de composant qu’ils implémentent. La validation refuse un callback destiné à une autre option avant chargement du module ; le runtime vérifie ensuite que l’export est une fonction avant allocation de la sandbox. Les résultats restent soumis à la validation du moteur natif.

```yaml title="outpost.yaml — extension de hook"
extensions:
  before:
    module: ./hooks.ts
    export: before
    kind: callback
    contract: hook.custom.run
    version: "1"
hooks:
  before:
    type: custom
    on: before-model
    run: { $ref: extensions.before }
```

Attachez le hook au harness avec `hooks: [{ $ref: hooks.before }]`. Appliquez le même modèle à l’exécution d’outils, au contexte personnalisé, aux instructions et à l’état du routage ; les erreurs indiquent le contrat attendu. Les factories peuvent aussi recevoir des références typées par les annotations de leur schéma. Les composants possédés sont fermés dans l’ordre des dépendances ; les erreurs de fermeture des observateurs figurent dans `observerErrors` sans modifier la réussite des tâches.

Composez valeurs JSON, conditions, boucles, décisions et tâches isolées avec les [workflows de format 3](../recipe-workflows/). Une recette de données seule n’alloue aucune sandbox.
