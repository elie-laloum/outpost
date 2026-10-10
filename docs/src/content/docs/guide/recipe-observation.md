---
title: "Follow a recipe run"
description: "Add events or a final report to your execution configuration."
---

Add events or a final report to your [execution configuration](../recipe-configuration/). Use configuration version 2 or later.

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

The console sink writes events to stderr by default. The final report is published after sandbox and component cleanup. Omit `reports` to receive events without a final rendering; omit `observation` to request only the final report.

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
