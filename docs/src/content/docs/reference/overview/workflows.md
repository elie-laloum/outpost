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

`start({ onQuota })` pauses a task on an Outpost quota error and resumes it after the reset, in process or on a later start with the same checkpoint. See [quota pauses](../../../guide/quota-pauses/).

`loopTask` adds bounded attempt/check rounds with feedback and durable phase progress. See [verification loops](../../../guide/verification-loops/) for budgets, replay and caller-owned sessions.

A task `cache` restores a stored JSON result when the workflow, task, version and key match, without executing the task or replaying its side effects. See the [task result cache](../../../guide/task-cache/) for keys, `repositoryFingerprint`, failures and trust.

## Boundaries and responsibilities

Retries can repeat side effects. Budgets control admission using attempts and observed usage rather than guaranteeing a currency ceiling. Parallel tasks still need independent sandbox/workspace ownership. Checkpoints add persistence; they do not make external side effects transactional.

## Entry points

- [loopTask](../../looptask/)
- [task](../../task/)
- [workflow](../../workflow/)
- [TaskContext](../../taskcontext/)
- [WorkflowResult](../../workflowresult/)
- [agentTask](../../agenttask/)
- [commandTask](../../commandtask/)
- [isolatedTask](../../isolatedtask/)

[Learn with the practical guide](../../../guide/workflows/graph/).

`interactiveAgentTask` owns a fresh sandbox per dialogue turn and retains its worktree and conversation while waiting for a human answer. See [interactive tasks](../../../guide/interactive-tasks/) for durable input, supported harnesses and recovery.
