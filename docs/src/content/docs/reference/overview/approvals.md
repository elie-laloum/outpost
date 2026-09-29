---
title: "Approval and pause gates — Overview"
description: "Gate tasks hold a checkpointed workflow until a listed actor approves, resumes or rejects, optionally with a signed decision."
sidebar:
  label: Overview
  order: 0
---

## How a gate decides

A gate runs no code: it records a request and waits for a decision submitted to a later `start()` on the same checkpoint.

| Step                                         | What happens                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dependencies are `done`                      | The gate stores a `WorkflowPauseRequest` (`id`, `prompt`, `actors`) in its record; the run returns `paused`                                                        |
| `start({ checkpoint, decisions })`           | Each decision must match the `executionId`, gate `key` and pending `requestId`, name a listed actor and give a reason; any mismatch throws and applies no decision |
| `approve` (approval gate) / `resume` (pause) | The gate is `done`; dependent tasks read the `WorkflowDecisionRecord` as its value                                                                                 |
| `reject`                                     | The gate is `rejected`, dependents are skipped and the run ends `failed`, also on every later start                                                                |

Input waits are separate: an interactive task ends the run `waiting-input` and continues with `answers`, not `decisions`.

## Trusted or signed decisions

|                     | Trusted actor (default)                    | Signed (`authentication: "signed"`)                                                      |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Outpost checks      | `actor` is in the gate’s `actors`          | The same, plus an Ed25519 proof from a key bound to that actor                           |
| Who proves identity | Your application, before calling `start()` | Your signing service, with `signWorkflowDecision()`                                      |
| `start()` needs     | `decisions`                                | `decisions` with `proof`, and a `decisionVerifier`                                       |
| Record keeps        | The decision and `decidedAt`               | Also `verification`: the `keyId` and `verifiedAt`                                        |
| Also rejects        | —                                          | Missing verifier, unknown, duplicated or wrongly bound key, bad signature, expired proof |

:::caution
A gate’s `kind`, `prompt`, `actors` and `authentication` are part of checkpoint identity. Changing any of them makes a saved checkpoint incompatible.
:::

## Entry points

Guide: [Approvals](../../../guide/approvals/) · [Interactive tasks](../../../guide/interactive-tasks/) · [Durable runs](../../../guide/durable-runs/)

- [defineApprovalTask](../../defineapprovaltask/)
- [definePauseTask](../../definepausetask/)
- [signWorkflowDecision](../../signworkflowdecision/)
- [createEd25519DecisionVerifier](../../createed25519decisionverifier/)
- [WorkflowGateOptions](../../workflowgateoptions/)
- [WorkflowPauseRequest](../../workflowpauserequest/)
- [WorkflowDecision](../../workflowdecision/)
- [WorkflowDecisionRecord](../../workflowdecisionrecord/)
- [WorkflowDecisionVerifier](../../workflowdecisionverifier/)
- [WorkflowApproverKey](../../workflowapproverkey/)
