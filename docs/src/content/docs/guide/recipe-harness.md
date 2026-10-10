---
title: "Configure an agent loop in YAML"
description: "Add a model provider and tools to your execution configuration."
---

Add a model provider and tools to your [execution configuration](../recipe-configuration/). These declarations require configuration version 2 or later.

## Run the Outpost harness from YAML

Declare a model provider under `models`, then connect it to a harness with file-reading and editing tools. The `coder` role uses that harness.

```yaml title="outpost.yaml — built-in harness"
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

Replace `your-model-name` with a supported model and set `OPENAI_API_KEY` on the host. This configuration uses API-key billing. See [model providers](../model-providers/) for connection settings and the [agent loop](../harness/) for permissions and budgets.

## Request a structured result

A format-3 recipe can select a response contract from `outpost.yaml`.

```yaml title="recipe.yaml — a structured result"
version: 3
name: structured-review
tasks:
  - key: review
    agent: coder
    brief: Review the change.
    dispatch:
      response: { $ref: responses.verdict }
```

Add the contract to `outpost.yaml`. Outpost validates the JSON response; optional `repairs` allows correction attempts.

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

Validate both files with `outpost recipe validate --file recipe.yaml --config outpost.yaml`. Then [run the recipe](../recipe-cli/) and inspect the review task’s `value.summary`.
