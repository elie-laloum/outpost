---
title: "Speculative execution — Overview"
description: "Speculative execution explores several candidate implementations before selecting one to integrate."
sidebar:
  label: Overview
  order: 0
---

Speculative execution explores several candidate implementations before selecting one to integrate. Candidates produce their own work and validation evidence. This makes comparison an explicit orchestration decision rather than allowing competing agents to edit the same checkout concurrently.

## How it works

`speculate` coordinates candidate execution, validation and selection through its options and result contracts. Candidate outputs and the host snapshot provide the information needed to judge and safely apply a selected result. Parallelism does not remove workspace ownership or integration checks.

## Boundaries and responsibilities

This helper is an opt-in research capability. Selection is not evidence of correctness: enforce meaningful validation before integration. Account for the resources and model usage of all candidates, and preserve recoverable work when validation or host-state checks fail.

## Entry points

- [speculate](../../speculate/)
- [SpeculationOptions](../../speculationoptions/)
- [SpeculationResult](../../speculationresult/)
- [SpeculativeCandidate](../../speculativecandidate/)
- [SpeculativeValidation](../../speculativevalidation/)

[Learn with the practical guide](../../../guide/advanced/speculation/).
