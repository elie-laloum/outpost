---
title: "Configurer une boucle d’agent en YAML"
description: "Ajoutez un fournisseur de modèle et des outils à votre configuration d’exécution."
---

Ajoutez un fournisseur de modèle et des outils à votre [configuration d’exécution](../recipe-configuration/). Ces déclarations demandent la version 2 ou suivante de cette configuration.

## Exécuter le harness Outpost depuis le YAML

Déclarez un fournisseur sous `models`, puis reliez-le à une boucle d’agent munie d’outils de lecture et d’édition. Le rôle `coder` utilise cette boucle.

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

Remplacez `your-model-name` par un modèle pris en charge et définissez `OPENAI_API_KEY` sur l’hôte. Cette configuration utilise la facturation par clé API. Consultez les [fournisseurs de modèles](../model-providers/) pour la connexion et la [boucle d’agent](../harness/) pour les permissions et budgets.

## Demander un résultat structuré

Une recette de format 3 peut choisir un contrat de réponse déclaré dans `outpost.yaml`.

```yaml title="recipe.yaml — résultat structuré"
version: 3
name: structured-review
tasks:
  - key: review
    agent: coder
    brief: Review the change.
    dispatch:
      response: { $ref: responses.verdict }
```

Ajoutez le contrat à `outpost.yaml`. Outpost valide la réponse JSON ; l’option `repairs` permet des tentatives de correction.

```yaml title="outpost.yaml — response contract"
responses:
  verdict:
    type: json
    tag: review
    jsonSchema:
      type: object
      properties:
        summary: { type: string }
      required: [summary]
      additionalProperties: false
```

Validez les deux fichiers avec `outpost recipe validate --file recipe.yaml --config outpost.yaml`. Puis [lancez la recette](../recipe-cli/) et examinez `value.summary` dans le résultat de la tâche de relecture.
