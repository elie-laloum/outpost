---
title: "Approval and pause gates — Overview"
description: "An approval or pause gate is a durable decision point in a workflow."
sidebar:
  label: Overview
  order: 0
---

An approval or pause gate is a durable decision point in a workflow. It represents work that must wait for an explicit external decision before its dependants can proceed, rather than leaving a process blocked on an interactive prompt.

## How it works

`approvalTask` and `pauseTask` create gate tasks. The workflow persists the pending request and can return control to the caller. A later start submits decision records against that saved state; dependencies enforce the ordering around the gate.

## Boundaries and responsibilities

Actor identifiers are trusted metadata, not authentication. The application must establish who may submit a decision. Rejection is final for that run; an invalid decision batch is rejected before partial application. A persisted pause needs no timer or permanently running worker.

## Entry points

- [approvalTask](../../approvaltask/)
- [pauseTask](../../pausetask/)
- [WorkflowGate](../../workflowgate/)
- [WorkflowGateOptions](../../workflowgateoptions/)
- [WorkflowDecision](../../workflowdecision/)
- [WorkflowDecisionRecord](../../workflowdecisionrecord/)

[Learn with the practical guide](../../../guide/advanced/approvals/).
