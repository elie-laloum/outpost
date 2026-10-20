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
