---
title: "Workflows — Overview"
description: "A workflow is a graph of typed tasks and declared dependencies."
sidebar:
  label: Overview
  order: 0
---

A workflow is a graph of typed tasks and declared dependencies. It connects ordinary TypeScript operations, sandbox commands and agent jobs without requiring every step to use a model. Dependencies express both ordering and which results a task may read.

## How it works

`task` defines an operation; `workflow` validates and groups the graph; `start` executes it. Independent tasks may run concurrently within the configured limit. `agentTask` and `commandTask` use an existing sandbox, while `isolatedTask` owns allocation for its agent attempt.

## Boundaries and responsibilities

Retries can repeat side effects. Budgets control admission using attempts and observed usage rather than guaranteeing a currency ceiling. Parallel tasks still need independent sandbox/workspace ownership. Checkpoints add persistence; they do not make external side effects transactional.

## Entry points

- [task](../../task/)
- [workflow](../../workflow/)
- [TaskContext](../../taskcontext/)
- [WorkflowResult](../../workflowresult/)
- [agentTask](../../agenttask/)
- [commandTask](../../commandtask/)
- [isolatedTask](../../isolatedtask/)

[Learn with the practical guide](../../../guide/workflows/graph/).
