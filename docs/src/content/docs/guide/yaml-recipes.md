---
title: "Your first YAML recipe"
description: "Run a command and an agent from two local YAML files."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="create-a-recipe"></span>
<span id="declare-parameters-and-steps"></span>
<span id="run-and-inspect-the-result"></span>

## Review a README from YAML

This tutorial runs a command and then asks an agent to review your README. Complete [Installation](../setup/) to prepare Outpost, the `outpost:dev` image and Codex account access. You need a Git repository with a committed README.

Save the following two files in the repository. The recipe describes work you can share; `outpost.yaml` selects how it runs on your machine. Their `version` fields belong to different formats and need not match.

## Declare the two steps

The command checks Node.js inside the sandbox. The agent starts only after it succeeds. You can choose the review focus when running the recipe.

```yaml title="recipe.yaml"
version: 2
name: readme-review
inputs:
  focus:
    type: string
    description: What the review should focus on.
    default: setup instructions
tasks:
  - key: environment
    command:
      executable: node
      arguments: [-p, process.version]
  - key: review
    after: [environment]
    agent: coder
    brief: "Review the README {{ inputs.focus }}. Report findings without editing files."
```

## Choose the repository and agent

This configuration uses the image built during installation. `repository: .` resolves from the configuration file’s directory. The named branch keeps work separate from your current checkout; use a fresh name for a new independent review.

```yaml title="outpost.yaml"
version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:dev
branch:
  mode: named
  name: outpost/recipe-review
agents:
  coder:
    harness: codex
    authentication: account
```

Account access is prepared on the harness. To use API billing or another environment, follow [Configure recipe execution](../recipe-configuration/). Keep secrets in the local configuration by declared variable name, never in shared recipe inputs.

## Validate, run and inspect

From the directory containing the two files, validate before allocating a sandbox, then request a final JSON report:

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'focus=setup instructions' --json
```

Validation checks declarations and references; it does not test credentials or run commands. The run report contains the Node.js command output, the review answer, usage and workspace information. It appears after cleanup. Without `--json` or configured outputs, a successful execution is silent.

An agent instruction to avoid edits is not an access restriction. Inspect the named branch if changes were made; this configuration does not integrate it. A failed command stops dependent tasks. Failure or cancellation retains work for [recovery](../recovery/).

## Adapt the recipe

- [Pass results between steps](../recipe-workflows/): Use inputs, conditions and structured values.
- [Configure execution](../recipe-configuration/): Select credentials, providers, editor schemas and reports.
- [Save and resume](../recipe-durability/): Add checkpoints and human questions.
- [Find another recipe](../sharing-recipes/): Inspect downloaded work before executing it.
- [Use local TypeScript](../recipe-extensions/): Bind trusted callbacks or run the recipe engine from code.

The [CLI reference](../recipe-cli/#outpost-recipe-run) describes flags and exit codes. [defineRecipe](../../reference/definerecipe/) describes the compiled declaration.

<!-- Retained section anchors for existing bookmarks. -->

<span id="enable-editor-completion"></span>
<span id="configure-execution-once"></span>
<span id="declare-observation-and-final-reports"></span>
<span id="compose-native-configuration-components"></span>
<span id="select-secrets-before-allocation"></span>
<span id="run-the-outpost-harness-from-yaml"></span>
<span id="file-workspaces"></span>

<span id="reuse-a-step-result"></span>

<span id="use-the-engine-in-typescript"></span>
<span id="reuse-local-observer-objects"></span>
<span id="bind-typed-callbacks-locally"></span>

<span id="find-and-download-recipes"></span>
<span id="contribute-and-test-a-recipe"></span>
