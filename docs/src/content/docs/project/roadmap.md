---
title: Roadmap
description: Near-term priorities, medium-term directions and the evidence needed to deliver them.
sidebar:
  order: 3
---

Outpost's next priority is reliable everyday execution: a successful first run, explainable failures and recovery that has been exercised under real conditions. The horizons below express ordering, not promised dates or release numbers. The [changelog](../changelog/) records deliveries; this page describes the work ahead.

## Starting point

The foundation includes reusable sandboxes, Git workspaces, agent adapters, typed workflows and recovery tools. The CLI, authentication setup and custom Responses providers are documented in the [setup guide](../../guide/manual/cli/). Use the [API reference](../../reference/diagnosesandbox/) for implemented contracts and the changelog for released versions. An implementation or simulated test is not evidence of a successful live provider campaign.

Available since 4.2.0: [local/S3 storage transports](../../guide/operations/storage-transports/) cover artifacts, checkpoints, journals, conversations, recovery archives, reservations, activity and inventory/retention/quotas. Local and simulated S3 protocol tests exercise conflicts and restoration. Authenticated AWS/S3-compatible crash and pagination campaigns, operational reconciliation of abandoned owners and any NFS adapter remain validation or future work.

The [BullMQ/Redis adapter](../../guide/advanced/bullmq/) is available since 4.2.0: tests exercise real Redis leases, concurrent claims and interrupted publication/finalization. Production Redis failover campaigns remain outstanding. RabbitMQ remains planned for a later step.

## Near term: make execution dependable

| Priority                                    | Outcome                                                                                                                                                                                                          | Evidence required                                                                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Make authenticated cloud runs repeatable | Users can distinguish provider allocation, agent login, model access and network failures on Vercel and Daytona.                                                                                                 | Repeatable opt-in Claude/Codex campaigns with API keys and supported account credentials; sanitized reports tied to CLI versions and source commits; verified cleanup after failure, including allocations whose startup times out. |
| 2. Diagnose setup failures                  | Missing package managers, expired credentials, unreachable endpoints and incompatible models have actionable diagnostics before useful work starts, distinguishing HTTPS reachability from credential rejection. | First-run and recovery scenarios on Linux, macOS and Windows, including headless CI and cancellation. Authentication checks must not expose credentials or silently change billing methods.                                         |
| 3. Verify reproducible agent images         | Users can select an image whose bundled agents and provenance have been checked.                                                                                                                                 | A successful signed publication, independent signature verification and native CLI/container checks for the published digest.                                                                                                       |
| 4. Measure remote execution costs           | Transfer and startup optimizations have demonstrated benefits without weakening recovery.                                                                                                                        | Vercel/Daytona measurements on representative repositories, including large files, many small files, interrupted transfers and concurrent host edits.                                                                               |

Start with [cloud compatibility campaigns](../../guide/extend/cloud-compatibility/), [diagnostics](../../guide/operations/doctor/) and [agent images](../../guide/environment/providers/agent-images/). Fix contract failures before expanding the provider matrix. CI syntax probes and local simulated endpoints remain useful checks, but do not replace authenticated provider runs.

## Medium term: extend proven contracts

| Direction                     | Next useful capability                                                                       | Conditions before promotion                                                                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Durable distributed workflows | Operate checkpoints, approvals, artifacts and queues across multiple trusted workers.        | Fault-injection and restart campaigns, authenticated actor identity, credential rotation, operational guidance and explicit replay/idempotency policies. Never promise exactly-once side effects.                                           |
| Agent and model portability   | Extend native conversation support for Gemini and broaden tested custom model endpoints.     | Stable upstream protocols, native capture/resume/fork fixtures and service-specific Responses/tool compatibility evidence. Direct Chat Completions text calls are experimental in 4.2.0; the unreleased harness engine adds tool execution. |
| Remote interactive sessions   | Make remote troubleshooting and agent attachment reliable where providers support terminals. | Repeat Daytona PTY input, resize, exit, interruption and reuse campaigns across SDK updates; cover disconnections and long sessions. Evaluate Vercel attachment only when its execution contract supports it.                               |
| Stronger execution isolation  | Move selected isolation prototypes toward an operationally supported deployment.             | Real Firecracker boots, resource limits, jailer integration, lifecycle cleanup and adversarial review; measured container isolation and egress behavior.                                                                                    |
| Recoverable speculative work  | Resume interrupted candidate races and compare their actual cost and integration outcomes.   | Durable candidate ownership, recovery after coordinator failure, bounded cleanup and explicit conflict handling before integration.                                                                                                         |

These directions build on [durable workflows](../../guide/advanced/distributed/), [Gemini](../../guide/agents/gemini/), [repository isolation](../../guide/advanced/repository-isolation/), [Firecracker](../../guide/advanced/firecracker/), [egress policies](../../guide/advanced/egress/) and [speculation](../../guide/advanced/speculation/). Their documented limits remain in force until the corresponding evidence exists. Container allowlists, dynamic network policies, microVM snapshots and stronger artifact trust are candidates for this horizon, not current guarantees.

<a id="direct-model-harness"></a>

## Unreleased harness composition and engine

The working tree implements `agent({ harness, model })`, CLI harness presets, `openaiModelProvider` and `anthropicModelProvider`, and a built-in engine behind `harness()`. These are unreleased breaking changes; the published 4.2.0 API remains unchanged. Models are names or `{ name, reasoning, maxOutputTokens }` objects validated by the executing harness or provider, without a local availability catalog.

The engine runs in the Outpost process. Providers exchange messages, tool calls and replayable reasoning with Chat Completions, Responses and Anthropic Messages, including history caching. Tools declared with `defineHarnessTool()` run through the borrowed sandbox with validation, bounded concurrency, per-call deadlines and step, tool-call and token limits. Hooks and declarative permissions control tool calls and the end of the loop. Tests use scripted providers and local simulated HTTP services.

Still planned: built-in repository toolsets, durable custom conversations with resume, fork and response repairs, context management, skills and streaming. Authenticated service campaigns and complete repository-editing scenarios remain prerequisites for broader compatibility claims. No release date is promised.

## How priorities change

Reproducible failures, security boundaries and recovery of user work take precedence over new features. Promote a capability when its contract, failure behavior, tests and bilingual documentation agree. Keep work experimental when it depends on unvalidated infrastructure or unstable upstream behavior. Revisit the ordering after each release using observed failures and performance measurements; move delivered items into the changelog instead of growing a historical catalogue here.
