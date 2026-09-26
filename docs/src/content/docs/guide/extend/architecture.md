---
title: Architecture
description: Ports, adapters and domain boundaries in Outpost.
sidebar:
  order: 1
---

Outpost uses ports and adapters. Domain contracts describe capabilities; application services coordinate their use. Concrete agents and sandbox providers implement independent ports. A new agent does not require changes to sandbox allocation, and a new provider does not require changes to agent protocols.

| Layer             | Owns                                                                                | Dependencies                                   |
| ----------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| `domain`          | Contracts, validation, prompts, responses, task graphs and workflow execution rules | Domain and Node primitives                     |
| `adapters/agents` | Claude/Codex/Gemini command construction and event translation                      | Domain and infrastructure                      |
| `providers`       | Sandbox allocation, commands, transfers and disposal                                | Domain, infrastructure and provider services   |
| `infrastructure`  | Git, processes, files, native transcript storage and logging                        | Domain and infrastructure                      |
| `application`     | Resource ownership, use cases and remote synchronization                            | Domain, adapters, providers and infrastructure |
| `cli`             | Argument handling, onboarding and image commands                                    | Application and adapters                       |

## Contracts and configuration

Named contracts and object type declarations live in dedicated `*.types.ts` files next to their owner. These modules have no runtime initialization. Configuration defaults, supported options, recipes and shared limits belong in `*.constants.ts` files. Local variables and computed values stay with their operation.

The public facade remains `src/index.ts`, with the `providers/*` package subpaths and optional `opentelemetry` entry point. Only that telemetry entry imports the optional vendor API. Compatibility facades such as `providers/agents.ts`, `application/outpost.ts` and `domain/ports.ts` re-export implementations or contracts. Internal services import their dependencies directly.

## Agents and conversations

Each agent has its own factory, request builder and event decoder in `adapters/agents`. The factory composes these capabilities into `AgentAdapter`. Protocol decoding uses event-handler registries; unknown events remain raw observations.

`ConversationStore` is a separate port. Native stores delegate filesystem conventions to Claude and Codex layout strategies. Capture, restore, discovery and structural transcript rewriting have separate services. A custom store can be supplied without changing the execution pipeline.

## Resource lifecycle

`application/workspace.ts` owns the host workspace. `sandbox-provision.ts` acquires and prepares a provider lease. `sandbox.ts` composes dispatch, attachment and command operations; `operation-gate.ts` enforces exclusive ownership and waits for active work during closure.

`sandbox-dispatch.ts` owns the dispatch transaction: execution, transcript capture, synchronization, journal closure and recovery metadata. `agent-turn.ts` supervises one process; `agent-output.ts` accumulates protocol output; `activity-watchdog.ts` owns timers. Usage aggregation is a domain operation shared by warm and cold execution.

Owned-sandbox diagnostics use the same exclusive operation gate as commands and dispatch. Their temporary transfer probes clean up independently; diagnosis never takes ownership of lease disposal.

Workspaces and sandboxes retain separate lifetimes. Cold passes allocate separate environments; warm operations reuse a lease. Cancellation, continuation, hook ordering and recovery remain part of the contract.

## Providers and Git

Docker and Podman share the container adapter while preflight, allocation arguments, mounts, invocation and file transfers have separate modules. Vercel and Daytona compose dedicated command and transfer services. Optional SDK loading stays in the corresponding provider entry point.

Git infrastructure separates repository preparation, locking, managed worktree allocation, remote refresh, history collection and lease disposal. Dirty or detached worktrees, and worktrees containing ignored files, remain recoverable. Lock acquisition uses local process identity where available and conservatively refuses uncertain owners.

Remote synchronization follows explicit stages: download changes, validate them, back up host state, then apply changes. These services retain overlap checks, concurrent-edit detection and recovery artifacts. The coordinator owns the last synchronized revision and successful file manifest, and decides whether cleanup is safe. Optional `FileTransfers` capabilities provide verified incremental payload reuse and bounded compressed batches without coupling the coordinator to provider names.

Recovery inventory, integrity checks, isolated Git verification and retention are separate operations. Explicit pruning reacquires ownership and revalidates candidates; `assertRecoveryQuota` observes storage, while explicit reservations serialize cooperative admission and can be owned by a workspace. Resource activity records describe locally observed leases and operations, without enumerating remote accounts. Container dependency cache volumes have a separate, engine-managed lifetime.

## Workflows

Workflow graph validation, execution state, task retries and dependency scheduling are separate domain services. Task identity controls access to dependency values. Observer errors cannot alter execution outcomes.

## Extending and validating

To add an agent, implement `AgentAdapter` in its own module, with request and event contracts tested independently. Add a conversation layout or custom store when native continuation is supported. To add a sandbox backend, implement `SandboxProvider` and `SandboxLease`, including cancellation, transfer deadlines and idempotent disposal.

Run `npm run check` for architecture checks, type checking, unit/functional tests and the build. `npm run coverage` enforces 80% lines, branches and functions. Type-only modules are excluded from runtime coverage because TypeScript erases them; type checking and the packed consumer test validate their contracts. CLI command handlers are covered; only the process entry wrapper is excluded.

CI rejects reversed layer dependencies, inline contract declarations, runtime initialization in type modules, chained alternative branches and unused implementation declarations. Multi-platform checks, real Docker/Podman tests and a packed-package consumer exercise the supported boundaries. These checks support architectural review; they do not mechanically prove SRP.

## Durable orchestration and research boundaries

Checkpoint and gate contracts belong to the domain; the filesystem checkpoint adapter owns atomic persistence and local ownership. Artifact contracts validate values and lineage, while the filesystem store owns immutable bytes. The SQLite queue and HTTP transport provide durable claims; application workers execute registered handlers under fenced leases. Replay remains explicit and side effects are at least once. Gate actor names and artifact lineage are trusted metadata, not authentication.

The opt-in isolated container checkout, Firecracker provider, egress policies and speculative execution helper have separate [research limits](../../../project/roadmap/). Gemini has no native conversation store. Daytona terminal execution uses its native PTY API; Vercel rejects interactive attachment.

## Storage transports

`Transport` is a domain port for bounded binary reads, metadata listing and atomic conditional mutations. Local and optional S3 implementations belong to infrastructure; object stores keep artifact integrity, checkpoint ownership, journal ordering and conversation layouts separate from the transport. Native conversation copies and recovery verification still use local staging. The S3 SDK loads only through `transports/s3`.

Transport checkpoint ownership and cooperative reservation ledgers do not expire automatically. Explicit recovery must follow independent confirmation that the former owner stopped. Resource records stored remotely are observations with unverified ownership; they never authorize reclaiming local Git workspaces. Transport retention revalidates closed journal groups and each deletion revision. See [storage transports](../../operations/storage-transports/).

## Optional BullMQ queue

Only the `queues/bullmq` entry point loads the optional BullMQ SDK. Infrastructure separates connection ownership, BullMQ distribution and atomic Redis transitions of Outpost state. Application workers still depend on `TaskQueue`; retained results remain authoritative while interrupted native finalization is recovered.

## Harness composition

The unreleased API composes `agent({ harness, model })`. A CLI harness binds a command/protocol adapter; a custom harness declares a model provider, tools, instructions and limits for the built-in loop in `application/harness-loop.ts`. Tool definitions and JSON Schema validation live in the domain; tool execution, ordering and deadlines live in `application/tool-execution.ts`. Application supervision owns deadlines, scoped requests, sandbox operations and usage. Models are names or `{ name, reasoning, maxOutputTokens }` objects; the CLI harness or model provider rejects unsupported settings when the agent is composed, and the service validates availability. `sandboxProvider` selects allocation independently; a model provider never owns a sandbox. Tool code runs in the Outpost process and must cooperate with cancellation.
