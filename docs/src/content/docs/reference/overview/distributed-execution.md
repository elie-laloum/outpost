---
title: "Distributed execution — Overview"
description: "Distributed execution separates task admission from the process performing the work."
sidebar:
  label: Overview
  order: 0
---

Distributed execution separates task admission from the process performing the work. A durable queue holds jobs; workers claim them and run registered handlers. The same model can run entirely on one machine before the coordinator and workers move to separate hosts.

## How it works

`sqliteTaskQueue` provides durable queue storage. `serveTaskQueue` and `httpTaskQueue` expose it through HTTP; `runQueueWorker` executes handlers. `queuedTask` connects queue results to a typed workflow. Leases and fencing identify which worker claim may still report an outcome.

## Boundaries and responsibilities

Fencing rejects stale completions but cannot undo an external effect already performed. Design handlers for retries and at-least-once effects. Separate hosts need authenticated, protected transport; local loopback examples do not configure a production network or identity system.

## Entry points

- [sqliteTaskQueue](../../sqlitetaskqueue/)
- [serveTaskQueue](../../servetaskqueue/)
- [httpTaskQueue](../../httptaskqueue/)
- [runQueueWorker](../../runqueueworker/)
- [queuedTask](../../queuedtask/)
- [QueueLease](../../queuelease/)

[Learn with the practical guide](../../../guide/advanced/distributed/).
