---
title: "Trouver et partager des recettes"
description: "Télécharger une recette, l’examiner et lui associer votre configuration."
---

Après une [première exécution](../yaml-recipes/), réutilisez une recette d’un catalogue de confiance ou partagez votre YAML. Le téléchargement n’exécute jamais la recette ; votre configuration locale reste nécessaire.

## Trouver et télécharger des recettes

Le paquet inclut le catalogue officiel versionné dans Git : `fix-and-check`, `queued-review`, `review`, `review-change`, `review-and-approve` et `update-docs`. Listez-le et copiez une recette dans votre projet. Le téléchargement n’exécute aucun code et n’écrase aucun fichier existant. Gardez la configuration locale séparée et associez les rôles d’agents requis avant l’exécution.

```sh
npx outpost recipe list
npx outpost recipe fetch --recipe review --file review.yaml
npx outpost recipe validate --file review.yaml --config outpost.yaml
npx outpost recipe run --file review.yaml --config outpost.yaml \
  --input 'focus=Error handling' --json
```

Utilisez `--catalog` avec un chemin JSON local ou une URL HTTPS. Les chemins distants relatifs partent de l’URL finale du catalogue après redirections ; chaque téléchargement doit rester en HTTPS. Les transferts sont limités à 1 Mio et 15 secondes.

Avant d’écrire, le téléchargement vérifie SHA-256, valide la recette et contrôle son nom et sa révision. L’empreinte vérifie la cohérence avec le catalogue, pas l’identité de son auteur. Choisissez un éditeur de confiance et relisez la recette avant de l’exécuter avec vos identifiants.

## Contribuer et tester une recette

Ajoutez un fichier YAML de version 2 sous `recipes/`, avec un nom identique au nom du fichier, une description, une révision de recette et des paramètres documentés. Gardez sandbox, modèles et authentification dans le YAML séparé de l’utilisateur. Mettez à jour le catalogue depuis ces déclarations, ajoutez un test hors ligne, puis proposez la modification Git. La CI refuse les empreintes périmées.

```sh
node scripts/recipe-catalog.mjs --write
node scripts/recipe-catalog.mjs
bun run build
node --test examples/64-yaml-recipes/index.ts
```

Les catalogues tiers utilisent le JSON `{ "version": 1, "recipes": [...] }`. Chaque entrée déclare `name`, `version`, `description`, `source` et un `sha256` en minuscules. Les chemins sources peuvent être relatifs au catalogue ; les catalogues distants ne peuvent référencer que des ressources HTTPS. Version du catalogue, révision de recette et version du format ont des sens distincts.

Testez votre recette avec des [agents scriptés](../testing-workflows/) avant d’utiliser un compte payant. Dans le dépôt, `examples/64-yaml-recipes/` fournit une configuration YAML et un test hors ligne séparé avec de vrais commits Git. Ces contrôles ne valident pas les serveurs de catalogue réels, les agents payants ni l’exécution cloud.

API : [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/) · [RecipeConfiguration](../../reference/recipeconfiguration/).
