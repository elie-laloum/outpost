---
title: "Observability — Overview"
description: "Observability makes execution understandable without deciding its outcome."
sidebar:
  label: Overview
  order: 0
---

Observability makes execution understandable without deciding its outcome. Agent events describe progress and native activity; usage records expose reported token counts; reporters and telemetry adapters turn observations into logs, spans or metrics.

## How it works

Attach an observer to the operation you want to inspect. A reporter formats events for a person; the optional OpenTelemetry integration connects them to instrumentation. Observation is deliberately isolated: a failing observer must not change whether the underlying operation succeeds.

## Boundaries and responsibilities

Reported usage is not a monetary invoice, and local activity is not an inventory of a cloud account. Avoid putting prompts, credentials or unbounded identifiers in metric labels. Use operation results and enforced validation to make control-flow decisions.

## Entry points

- [reporter](../../reporter/)
- [createReporter](../../createreporter/)
- [DispatchTelemetry](../../dispatchtelemetry/)
- [AgentEvent](../../agentevent/)
- [AgentObservation](../../agentobservation/)
- [Usage](../../usage/)
- [openTelemetry](../../opentelemetry/)
- [OpenTelemetryOptions](../../opentelemetryoptions/)

[Learn with the practical guide](../../../guide/agents/observability/).
