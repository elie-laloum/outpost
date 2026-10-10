---
title: "Configure recipe execution"
description: "Select the repository, agents, environment and reports in outpost.yaml."
---

Keep the recipe shareable and put machine-specific choices in `outpost.yaml`. Start with [your first recipe](../yaml-recipes/); the sections below adapt its execution without changing its tasks.

## Configure execution once

Build the agent image with [setup](../setup/), then save this `outpost.yaml`. Repository and account-file paths resolve from its directory.

```yaml title="outpost.yaml"
version: 1
repository: .
sandbox:
  provider: docker
  image: outpost:dev
branch:
  mode: named
  name: outpost/recipe-change
agents:
  coder:
    harness: codex
    authentication: account
  reviewer:
    harness: codex
    authentication: account
```

Choose another environment with `sandbox.provider`: see [sandbox selection](../choose-a-sandbox/). Unsupported options fail before execution; cloud providers need their optional SDK and host credentials. The `local` provider runs directly on your host.

Declare [authentication](../authentication/) for each agent and, optionally, a model name or `{ name, reasoning, maxOutputTokens }`. Reference credentials by file or environment-variable name; literal secrets are refused. Only variables selected in `environment` reach the sandbox.

```yaml title="outpost.yaml — optional environment selection"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

The CLI allocates and closes the sandbox. This example retains a named branch for review. Without an explicit branch policy, YAML execution integrates changes into your checkout; use `current` or `named` when you want another behavior. Configuration strings stay literal.

## Enable editor completion

Use a YAML language server and add the schema comment to the recipe. The recipe and execution configuration have separate format versions.

```yaml title="recipe.yaml — editor schema"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe.schema.json
version: 3
```

The execution configuration has its own schema and format version. Use this header in `outpost.yaml` to get completion for sandbox, agents, observation and named components:

```yaml title="outpost.yaml — editor schema"
# yaml-language-server: $schema=https://elie-laloum.github.io/outpost/schemas/recipe-configuration.schema.json
version: 2
```

The URLs above follow the current stable documentation. Pin completion with `/outpost/schemas/<package-version>/recipe.schema.json` or `recipe-configuration.schema.json`, using the package version without `v`. Archived schemas exist only for versions that included both files. This version is separate from YAML’s `version` field.

Until these schemas are published, or when offline, use the installed package schema or a local checkout path. `recipe init` already uses the installed schema.

## Compose native configuration components

With configuration version 2, use `$ref` to reuse a named component. Keep `version: 2` and `repository` in your file; add the following declarations. Unknown references, incompatible types and cycles fail before allocation.

```yaml title="outpost.yaml — named provider"
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

See the [provider options](../choose-a-sandbox/) for mounts, caches and network restrictions. Firecracker is experimental and requires `experimental: true` plus a separately prepared host.

Put preparation, guards and storage under `workspace`. Keep repository, branch, sandbox and observation at the root. Host paths resolve from the configuration file; sandbox paths follow the provider’s rules.

```yaml title="outpost.yaml — workspace preparation"
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

Share instructions and tool permissions through a named [agent profile](../agent-profiles/). Each harness checks whether it can enforce the requested permissions.

```yaml title="outpost.yaml — a shared profile"
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

## File workspaces

Configuration version 3 adds explicit directory and ephemeral sources. See [Workspaces](../workspaces/) for file sources, output publication and explicit mounts. Versions 1 and 2 retain their Git contracts.

## Continue

- [Follow a recipe run](../recipe-observation/)
- [Configure the built-in agent loop](../recipe-harness/)
- [Select secrets](../secret-sources/)

<span id="declare-observation-and-final-reports"></span>
<span id="declare-reporters-and-telemetry"></span>

<span id="select-secrets-before-allocation"></span>

<span id="run-the-outpost-harness-from-yaml"></span>
