---
title: "Resource activity — Overview"
description: "Resource activity records describe the lifetimes and operations observed locally by Outpost."
sidebar:
  label: Overview
  order: 0
---

Resource activity records describe the lifetimes and operations observed locally by Outpost. They help connect a retained workspace, lease or failed operation to the execution that created it, without assuming that the remote resource is still alive.

## How it works

`inspectRecovery` collects recovery information for inspection. Resource records identify phases, operations and recorded outcomes; inspection entries express what can be determined from that local evidence. Use these reports to choose a diagnostic, restoration or retention action.

## Boundaries and responsibilities

Observation is not remote account enumeration, proof of liveness or automatic garbage collection. A process can stop before writing a final record. Treat uncertain ownership conservatively and keep inspection separate from actions that mutate or dispose resources.

## Entry points

- [inspectRecovery](../../inspectrecovery/)
- [RecoveryInspection](../../recoveryinspection/)
- [ResourceActivityRecord](../../resourceactivityrecord/)
- [ResourceInspection](../../resourceinspection/)
- [ResourceOperation](../../resourceoperation/)

[Learn with the practical guide](../../../guide/operations/recovery/).
