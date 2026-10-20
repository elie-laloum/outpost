---
title: "Your first YAML recipe"
description: "Run two local commands in an ephemeral workspace, without Git, Docker or an agent account."
---

Create a file, then read it in a second task. You need **Node.js 24+** and the Outpost package. This first run needs no Git repository, Docker image or agent account.

## 1. Install the package

In a new directory, install Outpost. Save both YAML files below in that directory.

```sh
npm install @elie-laloum/outpost
```

## 2. Describe the work

`recipe.yaml` lists the tasks. `after: [write]` makes the second command wait for the first; both use the same working directory.

```yaml title="recipe.yaml"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
name: hello-files
tasks:
  - key: write
    command:
      executable: node
      arguments:
        - -e
        - "require('node:fs').writeFileSync('hello.txt', 'Hello from Outpost!')"
  - key: read
    after: [write]
    command:
      executable: node
      arguments: [-p, "require('node:fs').readFileSync('hello.txt', 'utf8')"]
```

## 3. Choose where it runs

`outpost.yaml` selects an empty temporary workspace and local execution. Commands run on your machine with your permissions; `local` provides no isolation. `ephemeral` describes the working files, not a security boundary.

```yaml title="outpost.yaml"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 3
workspace:
  kind: ephemeral
sandbox:
  provider: local
```

Use **version 3 in both files** for these guides. Their versions describe separate YAML formats, not the installed package version. The schema comments enable completion in editors with a YAML language server.

## 4. Run and inspect

Validate the files, then execute the recipe with a final JSON report. Validation does not run commands or allocate a sandbox.

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml
npx outpost recipe run --file recipe.yaml --config outpost.yaml --json
```

In the report, `outputs.read.stdout` contains `Hello from Outpost!`. The workspace is temporary: `hello.txt` is not created beside your YAML files. Without `--json` or configured reports, a successful run is silent.

## Next steps

| You want to…                                               | Continue with…                                  |
| ---------------------------------------------------------- | ----------------------------------------------- |
| Keep generated files, copy a directory or use a Git branch | [Choose a workspace](../recipe-workspaces/)     |
| Add an agent or switch to Docker                           | [Configure execution](../recipe-configuration/) |
| Pass inputs and results between tasks                      | [Compose steps](../recipe-workflows/)           |
| See progress and final results                             | [Follow a run](../recipe-observation/)          |
| Pause for approval and resume                              | [Save progress](../recipe-durability/)          |

The [recipe CLI reference](../recipe-cli/) lists commands and flags.

<!-- Retained section anchors for existing bookmarks. -->

<span id="review-a-readme-from-yaml"></span>
<span id="declare-the-two-steps"></span>
<span id="choose-the-repository-and-agent"></span>
<span id="validate-run-and-inspect"></span>
<span id="adapt-the-recipe"></span>
<span id="create-a-recipe"></span>
<span id="declare-parameters-and-steps"></span>
<span id="run-and-inspect-the-result"></span>
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
