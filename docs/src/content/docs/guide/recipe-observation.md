---
title: "Follow a recipe run"
description: "Add events or a final report to your execution configuration."
---

Add events or a final report to your [execution configuration](../recipe-configuration/). Keep version 3 from the local tutorial.

## Declare observation and final reports

Use this complete configuration with the tutorial recipe to see events and its final report. A successful run without declared outputs is silent. Errors still reach stderr; `--json` explicitly selects one final JSON report and replaces configured final reports for that invocation.

```yaml title="outpost.yaml — observation and reports"
version: 3
workspace: { kind: ephemeral }
sandbox:
  provider: local
observation:
  sinks:
    - type: console
      format: json
reports:
  - type: json
    stream: stdout
```

The console sink writes events to stderr by default. The final report is published after sandbox and component cleanup. Omit `reports` to receive events without a final rendering; omit `observation` to request only the final report.

## Declare reporters and telemetry

A console sink is sufficient for normal event output. For telemetry, replace `observation` and `reports` with the following blocks and declare the tracer and meter extensions. OpenTelemetry borrows a host tracer and meter from declared extensions; only the observer is closed, and the optional integration is loaded when used.

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

## Persist and read execution state

Add a transport and reference it directly from observation. The default observation component is `client`; `type: hub` remains available for explicit low-level composition. Use this complete configuration with the tutorial recipe. Each run gets a generated observation ID, returned as `observationId` in the final report. To choose one in advance, add `runId: review-123` to the recipe’s `workflow` mapping, using a fresh ID for each independent run.

```yaml title="outpost.yaml — persisted observation"
version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
transports:
  runs:
    type: local
    directory: ./.outpost/storage
observation:
  type: client
  transporter: { $ref: transports.runs }
  sinks:
    - type: reporter
      label: review
reports:
  - type: json
```

The engine creates the run record and stops its heartbeat when the workflow settles. A checkpointed workflow uses its checkpoint run ID by default and resumes a settled observation history automatically. After explicit recovery of an interrupted execution, select a new `workflow.runId` if the previous observation is still unsettled. Neither observation nor reading grants recovery authorization.

Read the report’s `observationId` with `createObservation({ transporter })`, then call `observation.readRun(id)` or `observation.watchRun(id)` as shown in [execution state](../run-state/). The observation projection covers the workflow and its scoped tasks; allocation before the workflow and integration or cleanup afterwards still reach configured sinks but are outside the workflow’s persisted projection. The final recipe report also covers those later stages. The legacy `sink.run` component keeps its manual, single-execution ownership contract and should not be combined with automatic persistence for the same ID.

The report’s `runId` remains the checkpoint ID for resume commands; `observationId` identifies tracking, which can change after recovery.
