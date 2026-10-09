---
title: Advanced recipe composition
description: Compose experimental candidates, conflict resolvers and declared telemetry from YAML.
---

Recipe format 3 and configuration format 2 compose the public declarative families through native engines. [Available components](../yaml-components/) is generated from their descriptors. Functions, SDK clients and custom runtime objects use explicit local extensions; immediate inspection, signing and recovery utilities remain callable from trusted TypeScript modules. This is a local, unreleased implementation. Provider and agent restrictions still apply.

## Share candidate selection

Keep machine paths and credentials in the mandatory local configuration. A recipe can reference a named speculation, just as isolated tasks can reference `isolatedTasks`. The bundled `compare-candidates` recipe expects `speculations.compare`; its `goal` input can be interpolated in candidate briefs. A missing or incompatible reference fails validation.

```yaml title="recipe.yaml — selection"
version: 3
name: select-a-candidate
inputs:
  goal:
    type: string
    description: Change to attempt.
tasks:
  - key: select
    speculation: { $ref: speculations.compare }
```

Speculation requires `experimental: true` in configuration. Its native budget, validation and selection rules still apply. For `select: best`, supply a scoring callback as well as validation. Declare callbacks with contracts `speculation.options.validate` and `speculation.options.score`; see [local extensions](../yaml-recipes/#reuse-local-observer-objects).

```yaml title="outpost.yaml — candidate configuration"
experimental: true
speculations:
  compare:
    repository: ../project
    sandboxProvider: { $ref: sandboxProviders.build }
    budget: { attempts: 2 }
    select: best
    validate: { $ref: extensions.validate }
    score: { $ref: extensions.score }
    candidates:
      - key: solution
        agent: { $ref: agents.coder }
        request:
          brief: { text: "{{ inputs.goal }}" }
```

Add this section to the complete local configuration containing version, repository, sandbox, provider, agent and extension declarations. Selection retains the native winning branch and integration preflight; it never merges the winner implicitly. Results are JSON projections under `outputs.select.value`, including candidate results, retained workspaces and cumulative usage. [Speculation](../speculation/) explains selection and recovery. `examples/71-recipe-speculation/index.ts` runs offline after `bun run build` with `node --test examples/71-recipe-speculation/index.ts`.

Durable speculation also requires a workflow checkpoint and a provider with native recovery. Its effective inner run ID is the JSON tuple `[workflowRunId, taskKey, configuredSpeculationRunId]`, returned as `value.runId`; different workflow runs cannot reuse each other’s candidates. Its inner checkpoint identity includes the recipe, resolved parameters and relevant local configuration. The usage ledger and workflow receipts retain tokens across interrupted publication and replay. `recipe resume --retry-incomplete` authorizes interrupted candidate replay; it does not recover an owned speculation or remove workspace locks. Stop the old coordinator and use native `recoverSpeculation` with its exact revision before replay. Local and memory providers do not advertise recovery; unsupported combinations fail before allocation.

## Resolve integration conflicts

Declare a resolver separately, then connect it through `integration.onConflict`. It receives a separate named workspace and explicit provider. The runtime closes and synchronizes the execution sandbox before integrating, retains rejected work and keeps borrowed workspaces open. Resolver usage is returned in `report.integration.usage`, separately from workflow usage.

```yaml title="outpost.yaml — integration"
resolvers:
  repair:
    type: agent
    agent: { $ref: agents.resolver }
    sandboxProvider: { $ref: sandboxProviders.build }
    verify: { executable: npm, arguments: [test] }
integration:
  onConflict: { $ref: resolvers.repair }
  deadlineMs: 600000
```

The [native conflict-resolution contract](../workspaces/) still verifies the combined commit, rechecks diff guards and fences changed host/source commits. Verification failure retains recovery workspaces. A recipe cannot replace that verification with an agent's unverified assertion.

## Declare reporters and telemetry

A console sink is sufficient for normal event output. Existing text reporters, custom reporter handlers and OpenTelemetry can also be composed as sinks. OpenTelemetry borrows a host tracer and meter from declared extensions; only the observer is closed, and the optional integration is loaded when used.

```yaml title="outpost.yaml — telemetry"
observation:
  scope: { executionId: review }
  sinks:
    - type: reporter
      label: review
    - type: opentelemetry
      tracer: { $ref: extensions.tracer }
      meter: { $ref: extensions.meter }
reports:
  - type: json
    stream: stdout
```

A custom reporter uses `type: custom` and named `handlers`, each referencing a callback with its slot contract, such as `sink.custom.handlers.summary`. Shared hub scope accompanies allocation, tasks, agents, integration and cleanup. Owned sinks flush after the resources they observe. Borrowed objects stay caller-owned, and observer failures do not change execution outcomes. With neither observation nor reports, successful execution remains silent; `--json` explicitly requests one final report.

## Track coverage and validation

`recipes/parity.json` classifies public exports and options; `recipes/components.json` links component option paths to native or extension composition and family tests. CI rejects unclassified exports, changed signatures, new fields without classification, stale schemas and stale generated documentation. Native schemas come from the same TypeScript contracts, including mapped callback handler types.

The seven delivery lots cover configuration, harnesses, workflows, storage, services and experimental composition. Results and immediate utility functions do not acquire independent YAML declarations. `defineRecipe()` retains borrowed sandbox bindings; advanced document options require `createRecipeRuntime()` instead of being silently ignored. JSON projections retain conversation/artifact/workspace references and omit runtime methods.

Deterministic equivalence and failure tests use real temporary Git repositories, local processes and simulated agents/models. Docker and Redis have real integration checks. Podman was unavailable in the implementation environment; paid agents, cloud restoration, remote SDK authentication and external OpenTelemetry exporters have not received live validation.
