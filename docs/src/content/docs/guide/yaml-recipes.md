---
title: "Run YAML recipes"
description: "Create, validate and share parameterized command and agent recipes."
---

## Create a recipe

Use a recipe when the same sequence should run with different inputs or in several repositories. Keep the YAML in Git and let each user select their own sandbox and agents. From a project with Outpost installed, create a starter without overwriting existing files:

```sh
npx outpost recipe init --file recipe.yaml --config outpost.yaml
npx outpost recipe validate --file recipe.yaml --json
```

The starter links the installed `@elie-laloum/outpost/recipe.schema.json` for editor completion. `validate` checks the format, graph and references without importing configuration or allocating a sandbox. Its report lists parameters and required agent names; it does not run commands or check installed tools. Validation errors include a source location when available.

## Declare parameters and steps

This version-2 recipe accepts a change request. Inputs without defaults are required. Numbers and booleans retain their types during validation, then become text when inserted into a brief or command argument. An optional `enum` restricts accepted values. `recipeVersion` identifies your recipe revision; `version` selects the Outpost recipe format.

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

Append these tasks to the same file. `after` refers to task keys and allows forward declarations. Both steps share one sandbox; a failed command stops dependent work. Existing workflow retries and timeouts remain available.

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

Version 1 remains literal, including `${NAME}` and double braces. Version 2 expands only explicit `{{ inputs.name }}` and `{{ steps.key.field }}` references in briefs and command strings. Unknown references fail validation. Values are substituted once; their contents cannot introduce new references. Executables and argument arrays are passed directly. An explicitly selected shell still interprets its arguments as shell code, so pass untrusted input through arguments or stdin instead of interpolating shell programs. Resolve secrets in the local configuration, outside YAML inputs.

## Reuse a step result

An agent exposes `text`; a command exposes `stdout`, `stderr` and numeric `status`. Add every referenced step to `after`, even when another dependency already follows it. This review receives the implementation summary after verification succeeds:

```yaml title="recipe.yaml — append to tasks"
- key: review
  after: [fix, verify]
  agent: reviewer
  brief: "Review the committed change. Summary: {{ steps.fix.text }}"
```

The engine passes the actual result to the next step. CLI reports bound each returned text field to 16,384 characters with an explicit truncation marker. References provide data, not conversation continuation; files remain shared through the sandbox workspace.

## Configure execution once

Keep execution choices in a separate, required `outpost.yaml`. Reuse it across community recipes without editing their YAML. The repository and account-file paths resolve relative to this configuration file, independently of your current directory. Build the agent image through [setup](../setup/) first.

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

Select Docker, Podman, explicit unisolated `local`, Vercel or Daytona with `sandbox.provider`. Image selection applies to Docker, Podman and Daytona; CPU and memory options apply to Docker and Podman. Unsupported fields fail explicitly. Cloud integrations require their optional SDKs and host-side provider authentication. The packaged `recipe-configuration.schema.json` provides editor completion. The CLI checks required agents before opening the sandbox.

Agent harness names come from Outpost’s built-in catalogue. Each agent requires an explicit authentication selection; see [authentication](../authentication/) for account and API-key behavior. An optional model is a name or a mapping with `name`, `reasoning` and `maxOutputTokens`, validated by that harness. Authentication accepts `account`, `usage`, an account `file` or `variable`, or a usage `variable`; inline credential keys are refused. Only names declared in `environment` are copied from the host into provider variables; validation with `--config` does not resolve their values.

```yaml title="outpost.yaml — optional environment selection"
environment:
  PROJECT_TOKEN: PROJECT_TOKEN
```

The CLI owns allocation, integration and cleanup. Integration is the YAML configuration’s default branch policy; use `current` or a `named` branch explicitly when needed. Configuration values remain literal. Existing TypeScript/JavaScript `RecipeConfiguration` modules and factories `(signal: AbortSignal) => RecipeBindings` remain compatible for custom integrations. Factories return an already open sandbox, so their agent roles can only be checked after allocation, and they own cleanup if they throw before returning.

## Run and inspect the result

Pass inputs with repeated `--input name=value`. String inputs remain literal; number and boolean inputs use JSON scalar syntax. Unknown, duplicate, missing or mistyped inputs fail before configuration loads. Both file paths are relative to the current directory; command directories are interpreted inside the sandbox.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml \
  --input 'goal=Handle empty parser input' --input runner=npm --json
```

When a final report is requested, the CLI waits for integration and cleanup before publishing it. Successful runs call workspace integration according to the configured branch policy. Failure or cancellation preserves the workspace. `status` includes finalization failures; `workflowStatus` describes the tasks separately. Reports include bounded task outputs, command diagnostics, usage and workspace location. SIGINT/SIGTERM cancel setup or execution and wait for cleanup. See [CLI commands](../cli/#outpost-recipe-run) for flags and exit codes.

## Use the engine in TypeScript

`defineRecipe()` borrows the sandbox and returns a [Workflow](../../reference/type-workflow/). Here the caller owns integration, preservation and cleanup; the engine only executes tasks. Supply typed values through `inputs` and inspect results using the normal workflow API.

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

Recipes require concurrency 1. Agent results cannot be stored as lossless JSON checkpoints; use [typed workflows](../typed-workflows/) for durable runs, gates and custom projections. Both formats accept one YAML 1.2 document, at most 1 MiB and 1,000 tasks, with unknown fields, duplicate keys, aliases, custom tags, missing dependencies and cycles rejected.

## Find and download recipes

The package includes the official Git-versioned catalogue: `fix-and-check`, `review` and `update-docs`. List it and copy a recipe into your project. Fetching never executes code or overwrites an existing file. Keep the local configuration separate and bind the required agent roles before running.

```sh
npx outpost recipe list
npx outpost recipe fetch --recipe review --file review.yaml
npx outpost recipe validate --file review.yaml --config outpost.yaml
npx outpost recipe run --file review.yaml --config outpost.yaml \
  --input 'focus=Error handling' --json
```

Pass `--catalog` with a local JSON path or an HTTPS URL to use a third-party catalogue. Remote relative recipe paths resolve against the final catalogue URL after redirects, and every remote download must remain HTTPS. Transfers are bounded to 1 MiB and 15 seconds. Fetch verifies SHA-256, validates the recipe and checks its name and revision before writing. The digest verifies bytes against the selected catalogue; choose a publisher you trust and review recipes before executing them with your credentials.

## Contribute and test a recipe

Add a version-2 YAML file under `recipes/` with a matching filename and name, a description, a recipe revision and documented inputs. Keep sandbox choices, models and authentication in the consumer’s separate YAML. Update the catalogue from those declarations, add an offline test, then submit the Git change. CI rejects stale catalogue digests.

```sh
node scripts/recipe-catalog.mjs --write
node scripts/recipe-catalog.mjs
bun run build
node --test examples/64-yaml-recipes/index.ts
```

Third-party catalogues use JSON `{ "version": 1, "recipes": [...] }`. Each entry declares `name`, `version`, `description`, `source` and a lowercase `sha256`. Source paths may be relative to the catalogue; remote catalogues may only reference HTTPS resources. Catalogue versions, recipe revisions and format versions have separate meanings.

Use [workflow testing](../testing-workflows/) for tests without paid accounts. `examples/64-yaml-recipes/` provides a production YAML configuration and a separate TypeScript test fixture with scripted agents, a simulated command and real Git commits. Its two-line index comment explains execution, and the example runs in CI. Functional tests also execute an unchanged recipe through YAML configuration against two real repositories and verify argument preservation, integration and failure reports. Download tests use simulated HTTP responses; live catalogue servers, agent calls and cloud runs remain unvalidated.

API: [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/) · [RecipeConfiguration](../../reference/recipeconfiguration/).

## Declare observation and final reports

Configuration version 2 can attach one observation hub to allocation, workflow tasks, agent activity and cleanup. A successful run without declared outputs is silent. Errors still reach stderr; `--json` explicitly selects one final JSON report and replaces configured final reports for that invocation.

```yaml title="outpost.yaml — observation and reports"
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

The console sink writes events to stderr by default. The final report is published after sandbox and component cleanup. Omit `reports` to receive events without a final rendering; omit `observation` to request only the final report. Recipe formats 1 and 2 remain supported; format 3 starts with the same command and agent task contracts and is extended as native component families become available.

## Reuse local observer objects

Declare extensions only in your local configuration. A module can export an already constructed object, borrowed for the invocation, or a factory with a static JSON Schema and an explicitly named disposer. Static validation checks these declarations without importing the module; runtime validation checks the actual export before sandbox allocation.

```yaml title="outpost.yaml — borrowed observer"
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

The exported `sink` implements `ObservationSink`. A borrowed object is never closed by the runtime. For a factory, add `factory: true`, `schema`, optional `options` and optional `dispose` naming another export. Factories receive their options and a context with cancellation, the configuration directory and named component resolution. Only local modules and already installed packages are accepted; a downloaded recipe cannot import extensions itself.

The `/recipes` package entry exposes `defineRecipeComponent`, `createRecipeRegistry`, `validateRecipeProject` and `createRecipeRuntime`. Runtime construction validates without allocating; `run()` allocates and cleans each invocation, and `close()` cancels an active invocation and prevents further runs. `examples/65-recipe-observation/` exercises declared observation and reporting without model calls.

The parity inventory in `recipes/parity.json` classifies public contracts and tracks deliveries. Native workflow durability, service commands and the remaining component families are tracked there; the registry foundation alone does not establish full YAML/TypeScript parity.

## Compose native configuration components

Configuration version 2 keeps `sandbox` and `agents` as short forms. A named provider can also be reused through an explicit `$ref`. References name a family and component; unknown names, incompatible categories and cycles fail before allocation. Add these declarations to the local configuration with its required repository.

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

Provider options follow their TypeScript contracts, including mounts, dependency caches and egress restrictions. Cloud caches can reference named transports. Provider SDKs load only when used. Firecracker remains experimental and requires `experimental: true`; declaring it does not validate the host setup. See [sandbox selection](../choose-a-sandbox/) and the provider API for supported options and live-validation limits.

Put preparation, diff guards, stage limits, copies, logging and storage settings under `workspace`. Keep repository, branch, sandbox provider and observation at the configuration root. Host paths resolve from that file's directory; paths inside the sandbox retain their provider semantics. `examples/66-recipe-components/` executes preparation and a command against temporary local Git resources.

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

Portable profiles and all CLI harness settings use the same factories as TypeScript. Declare a profile once and reference it from an agent role; MCP declarations and explicit authentication retain their existing capability checks. The local provider remains unisolated. Account files resolve on the host and remain separate from conversation storage.

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

## Select secrets before allocation

An environment value can use `{ env: VARIABLE_NAME }`. Secret-manager components use their public options; clients supplied by installed SDKs are borrowed `object` extensions. For example, the Vault token below is read on the host only during execution. Native secret sources are under `secrets`; `variables.secrets` selects explicit names through `fromSecrets()`.

```yaml title="outpost.yaml — a host-side secret source"
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

Only the selected values reach the sandbox. Validation neither imports user modules nor reads secret values. Missing values fail before allocation; the runtime masks selected values in observations, returned reports and execution diagnostics. It does not modify the host environment. See [secret sources](../secret-sources/) for manager-specific restrictions and credential ownership.

Static schemas are generated from the installed public TypeScript types and checked in CI. Local lifecycle execution, extension loading, secret selection and CLI request equivalence have offline regressions. These tests do not exercise real cloud providers, secret-manager services or paid agents.

## Run the Outpost harness from YAML

The `outpost` harness accepts named or inline tools, permissions, context strategies, hooks, skills, model routing and conversations. Bind a model provider under `models`, then reference the harness from the recipe's agent role. All executions use the existing TypeScript harness loop, including its permission checks and cumulative subagent budgets.

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

Select a supported model for your provider before running; this configuration uses API-key billing. See [the Outpost harness](../harness/) for behavior and [model providers](../model-providers/) for connection settings. `examples/67-recipe-harness/` replaces the service with a local HTTP fixture and runs without credentials or paid calls.

Format-3 agent steps accept `dispatch` options. A named response contract supplies JSON Schema validation and the existing final-answer instructions. Dispatch component references require the two-file runtime; the original `defineRecipe` bindings continue to serve borrowed-sandbox command and agent recipes.

```yaml title="recipe.yaml — a structured result"
version: 3
name: structured-review
tasks:
  - key: review
    agent: reviewer
    brief: Review the change.
    dispatch:
      response: { $ref: responses.verdict }
```

Declare `responses.verdict` in the local configuration with `type: json`, a `tag` and `jsonSchema`. Optional `repairs` uses the existing response-repair loop. For custom validation, `schema` references a validator object or a callback extension. Native `text` responses, fallback agents and conversation-store components retain their TypeScript contracts.

## Bind typed callbacks locally

Callbacks stay in local modules and are selected through configuration. Their static `contract` names the component option they implement. The validator rejects a callback intended for another slot before loading its module; the runtime then checks that the export is callable before sandbox allocation. Callback return values remain subject to the native engine's validation.

```yaml title="outpost.yaml — a hook extension"
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

Attach the hook through `hooks: [{ $ref: hooks.before }]` on a harness. Apply the same pattern to tool execution, custom context, instructions and routing state; errors identify the required contract. Factories can also receive typed component references through schema annotations. Owned components close in dependency order; observer cleanup errors appear in `observerErrors` without changing a successful task outcome.
