---
title: "Dispatch — Overview"
description: "Dispatch is the operation that gives an agent a brief and collects what happened: turns, text, typed output, usage, commits and available conversation data."
sidebar:
  label: Overview
  order: 0
---

Dispatch is the operation that gives an agent a brief and collects what happened: turns, text, typed output, usage, commits and available conversation data. It is the bridge between an agent protocol and the workspace where the agent acts.

## How it works

The top-level `dispatch` function allocates and closes its own environment. Calling `sandbox.dispatch` instead uses an existing warm environment owned by the caller. Passes, deadlines, cancellation and response validation bound the operation; continuation can carry native agent context into a later run.

## Boundaries and responsibilities

Read the result according to its contract. A completion marker, generated answer or commit does not prove that tests passed. Use an actual command or workflow gate for checks the program must enforce. Git integration remains a separate policy decision.

## Entry points

- [dispatch](../../dispatch/)
- [DispatchOptions](../../dispatchoptions/)
- [DispatchResult](../../dispatchresult/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [ContinuationOptions](../../continuationoptions/)

[Learn with the practical guide](../../../guide/agents/dispatch/).
