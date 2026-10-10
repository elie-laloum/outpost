---
title: "Find and share recipes"
description: "Download a recipe, inspect it and bind your own execution configuration."
---

After [running a first recipe](../yaml-recipes/), reuse a recipe from a trusted catalog or publish your own YAML for others. Downloading a recipe never runs it; execution still requires your local configuration.

## Find and download recipes

The package includes the official Git-versioned catalogue: `fix-and-check`, `queued-review`, `review`, `review-change`, `review-and-approve` and `update-docs`. List it and copy a recipe into your project. Fetching never executes code or overwrites an existing file. Keep the local configuration separate and bind the required agent roles before running.

```sh
npx outpost recipe list
npx outpost recipe fetch --recipe review --file review.yaml
npx outpost recipe validate --file review.yaml --config outpost.yaml
npx outpost recipe run --file review.yaml --config outpost.yaml \
  --input 'focus=Error handling' --json
```

Use `--catalog` with a local JSON path or an HTTPS URL. Remote relative paths resolve from the catalog’s final URL after redirects; every download must remain HTTPS. Transfers are limited to 1 MiB and 15 seconds.

Before writing, fetch checks SHA-256, validates the recipe and matches its name and revision. The digest checks consistency with the catalog, not publisher identity. Choose a trusted publisher and review the recipe before running it with your credentials.

## Contribute and test a recipe

Add a version-2 YAML file under `recipes/` with a matching filename and name, a description, a recipe revision and documented inputs. Keep sandbox choices, models and authentication in the consumer’s separate YAML. Update the catalogue from those declarations, add an offline test, then submit the Git change. CI rejects stale catalogue digests.

```sh
node scripts/recipe-catalog.mjs --write
node scripts/recipe-catalog.mjs
bun run build
node --test examples/64-yaml-recipes/index.ts
```

Third-party catalogues use JSON `{ "version": 1, "recipes": [...] }`. Each entry declares `name`, `version`, `description`, `source` and a lowercase `sha256`. Source paths may be relative to the catalogue; remote catalogues may only reference HTTPS resources. Catalogue versions, recipe revisions and format versions have separate meanings.

Test your recipe with [scripted agents](../testing-workflows/) before using a paid account. The repository’s `examples/64-yaml-recipes/` provides a YAML configuration and a separate offline fixture with real Git commits. These checks do not validate live catalog servers, paid agents or cloud execution.

API: [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/) · [RecipeConfiguration](../../reference/recipeconfiguration/).
