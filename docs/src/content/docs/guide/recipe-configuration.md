---
title: "Add an agent and choose execution"
description: "Configure agent roles, local or container execution and YAML editor completion."
---

`recipe.yaml` describes the work; `outpost.yaml` binds agent roles and chooses the environment. Start with the [local tutorial](../yaml-recipes/). Use [workspace configuration](../recipe-workspaces/) for directories, branches and output files.

## Add an agent

For this local example, the Codex CLI must already be installed and authenticated on the host; follow the [Codex guide](../codex/). Save these two complete files. Commands and agents run with your host permissions.

```yaml title="outpost.yaml"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: feature/welcome, from: main }
sandbox:
  provider: local
agents:
  writer:
    harness: codex
    authentication: account
```

The recipe selects the configured `writer` role. Use a Git repository at `./project` with a `main` branch. The agent creates `welcome.md` on a separate branch. The current YAML validator still refuses native CLI harnesses in file workspaces, even where the TypeScript API advertises file capabilities; use the [Outpost harness](../recipe-harness/) for a file-only recipe.

```yaml title="recipe.yaml"
version: 3
name: write-note
tasks:
  - key: draft
    agent: writer
    brief: Write a short welcome message in welcome.md, then summarize it.
```

Run with `npx outpost recipe run --file recipe.yaml --config outpost.yaml --json` and inspect `outputs.draft.text`. The named branch is retained without automatic integration. Choose [authentication](../authentication/) explicitly for every CLI role; model selection is optional.

## Switch to Docker

Prepare the Codex image using [agent images](../agent-images/), then replace only `sandbox` in the configuration above. Keep the workspace and agent role.

```yaml title="outpost.yaml — sandbox"
sandbox:
  provider: docker
  image: outpost-codex:dev
```

Other providers use their own [sandbox options](../choose-a-sandbox/). Unsupported workspace or agent capabilities are refused. Container file workspaces require an explicit image.

## Share a profile

Add `profiles` and replace `agents` in the same configuration. Profiles share instructions, supported tool restrictions and MCP declarations. A brief asking an agent not to edit files does not enforce read-only access.

```yaml title="outpost.yaml — profiles"
profiles:
  writing:
    type: portable
    instructions: Write concise, plain-language documents.
agents:
  writer:
    harness: codex
    authentication: account
    profile: { $ref: profiles.writing }
```

Native CLI lifecycle hooks and profile hook callbacks require [local extensions](../recipe-extensions/). The [built-in harness](../recipe-harness/) has its own tools, permissions and hook declarations.

## Select environment variables

Add this top-level block to forward only the selected host variable. Keep secret values out of recipes and configuration files. [Secret sources](../secret-sources/) can resolve selected names through declared components and host clients.

```yaml title="outpost.yaml — environment"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

## Enable editor completion

Keep the corresponding header at the top of each file, followed by its existing contents. These URLs follow the deployed documentation. For reproducible completion, use `/outpost/schemas/<package-version>/recipe.schema.json` and `recipe-configuration.schema.json`, without `v`; archives exist for releases containing both schemas.

```yaml title="recipe.yaml — schema header"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
```

```yaml title="outpost.yaml — schema header"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 3
```

Offline, use a relative path such as `./node_modules/@elie-laloum/outpost/recipe.schema.json`. `recipe init` writes installed-schema paths automatically. YAML format versions and package versions are independent; these guides use format 3, while older formats remain supported.

## Find the next setting

| Goal                                              | Guide                                  |
| ------------------------------------------------- | -------------------------------------- |
| Branches, copied files, mounts and publication    | [Workspaces](../recipe-workspaces/)    |
| Model providers, tools and validated JSON answers | [Agent loop](../recipe-harness/)       |
| Progress events and final reports                 | [Observation](../recipe-observation/)  |
| Named components and their supported options      | [YAML components](../yaml-components/) |

<!-- Retained section anchors for existing bookmarks. -->

<span id="configure-execution-once"></span>
<span id="compose-native-configuration-components"></span>
<span id="file-workspaces"></span>
<span id="continue"></span>
<span id="declare-observation-and-final-reports"></span>
<span id="declare-reporters-and-telemetry"></span>
<span id="select-secrets-before-allocation"></span>
<span id="run-the-outpost-harness-from-yaml"></span>
