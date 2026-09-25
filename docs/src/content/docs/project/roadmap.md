---
title: Roadmap
description: Near-term priorities, medium-term directions and the evidence needed to deliver them.
sidebar:
  order: 3
---

Outpost's next priority is reliable everyday execution: a successful first run, explainable failures and recovery that has been exercised under real conditions. The horizons below express ordering, not promised dates or release numbers. The [changelog](../changelog/) records deliveries; this page describes the work ahead.

## Starting point

The foundation includes reusable sandboxes, Git workspaces, agent adapters, typed workflows and recovery tools. The CLI, authentication setup and custom Responses providers are documented in the [setup guide](../../start/cli/). Use the [API reference](../../reference/) for implemented contracts and the changelog for released versions. An implementation or simulated test is not evidence of a successful live provider campaign.

## Near term: make execution dependable

| Priority                                    | Outcome                                                                                                                                                                                                          | Evidence required                                                                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Make authenticated cloud runs repeatable | Users can distinguish provider allocation, agent login, model access and network failures on Vercel and Daytona.                                                                                                 | Repeatable opt-in Claude/Codex campaigns with API keys and supported account credentials; sanitized reports tied to CLI versions and source commits; verified cleanup after failure, including allocations whose startup times out. |
| 2. Diagnose setup failures                  | Missing package managers, expired credentials, unreachable endpoints and incompatible models have actionable diagnostics before useful work starts, distinguishing HTTPS reachability from credential rejection. | First-run and recovery scenarios on Linux, macOS and Windows, including headless CI and cancellation. Authentication checks must not expose credentials or silently change billing methods.                                         |
| 3. Verify reproducible agent images         | Users can select an image whose bundled agents and provenance have been checked.                                                                                                                                 | A successful signed publication, independent signature verification and native CLI/container checks for the published digest.                                                                                                       |
| 4. Measure remote execution costs           | Transfer and startup optimizations have demonstrated benefits without weakening recovery.                                                                                                                        | Vercel/Daytona measurements on representative repositories, including large files, many small files, interrupted transfers and concurrent host edits.                                                                               |

Start with [cloud compatibility campaigns](../../operations/cloud-compatibility/), [diagnostics](../../operations/doctor/) and [agent images](../../providers/agent-images/). Fix contract failures before expanding the provider matrix. CI syntax probes and local simulated endpoints remain useful checks, but do not replace authenticated provider runs.

## Medium term: extend proven contracts

| Direction                     | Next useful capability                                                                       | Conditions before promotion                                                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Durable distributed workflows | Operate checkpoints, approvals, artifacts and queues across multiple trusted workers.        | Fault-injection and restart campaigns, authenticated actor identity, credential rotation, operational guidance and explicit replay/idempotency policies. Never promise exactly-once side effects.             |
| Agent and model portability   | Extend native conversation support for Gemini and broaden tested custom model endpoints.     | Stable upstream protocols, native capture/resume/fork fixtures and service-specific Responses/tool compatibility evidence. Chat Completions support needs a separate execution strategy.                      |
| Remote interactive sessions   | Make remote troubleshooting and agent attachment reliable where providers support terminals. | Repeat Daytona PTY input, resize, exit, interruption and reuse campaigns across SDK updates; cover disconnections and long sessions. Evaluate Vercel attachment only when its execution contract supports it. |
| Stronger execution isolation  | Move selected isolation prototypes toward an operationally supported deployment.             | Real Firecracker boots, resource limits, jailer integration, lifecycle cleanup and adversarial review; measured container isolation and egress behavior.                                                      |
| Recoverable speculative work  | Resume interrupted candidate races and compare their actual cost and integration outcomes.   | Durable candidate ownership, recovery after coordinator failure, bounded cleanup and explicit conflict handling before integration.                                                                           |

These directions build on [durable workflows](../../workflows/distributed/), [Gemini](../../agents/gemini/), [repository isolation](../../providers/repository-isolation/), [Firecracker](../../providers/firecracker/), [egress policies](../../sandboxes/egress/) and [speculation](../../workflows/speculation/). Their documented limits remain in force until the corresponding evidence exists. Container allowlists, dynamic network policies, microVM snapshots and stronger artifact trust are candidates for this horizon, not current guarantees.

## How priorities change

Reproducible failures, security boundaries and recovery of user work take precedence over new features. Promote a capability when its contract, failure behavior, tests and bilingual documentation agree. Keep work experimental when it depends on unvalidated infrastructure or unstable upstream behavior. Revisit the ordering after each release using observed failures and performance measurements; move delivered items into the changelog instead of growing a historical catalogue here.
