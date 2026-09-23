# Architecture

[Français](architecture.fr.md)

Outpost uses ports and adapters. Domain contracts describe capabilities; application services coordinate their use. Concrete agents and sandbox providers implement independent ports. A new agent does not require changes to sandbox allocation, and a new provider does not require changes to agent protocols.

| Layer               | Owns                                                                                | Dependencies                                   |
| ------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| `domain`            | Contracts, validation, prompts, responses, task graphs and workflow execution rules | Domain and Node primitives                     |
| `adapters/agents`   | Claude/Codex command construction and event translation                             | Domain and infrastructure                      |
| `adapters/backlogs` | GitHub/Beads issue access                                                           | Domain and infrastructure                      |
| `providers`         | Sandbox allocation, commands, transfers and disposal                                | Domain, infrastructure and provider services   |
| `infrastructure`    | Git, processes, files, native transcript storage and logging                        | Domain and infrastructure                      |
| `application`       | Resource ownership, use cases, campaigns and remote synchronization                 | Domain, adapters, providers and infrastructure |
| `cli`               | Argument handling, onboarding and image commands                                    | Application and adapters                       |

## Contracts and configuration

Named contracts and object type declarations live in dedicated `*.types.ts` files next to their owner. These modules have no runtime initialization. Configuration defaults, supported options, recipes and shared limits belong in `*.constants.ts` files. Local variables and computed values stay with their operation.

The public facade remains `src/index.ts`, with the existing `providers/*` package subpaths. Compatibility facades such as `providers/agents.ts`, `application/outpost.ts` and `domain/ports.ts` re-export implementations or contracts. Internal services import their dependencies directly.

## Agents and conversations

Each agent has its own factory, request builder and event decoder in `adapters/agents`. The factory composes these capabilities into `AgentAdapter`. Protocol decoding uses event-handler registries; unknown events remain raw observations.

`ConversationStore` is a separate port. Native stores delegate filesystem conventions to Claude and Codex layout strategies. Capture, restore, discovery and structural transcript rewriting have separate services. A custom store can be supplied without changing the execution pipeline.

## Resource lifecycle

`application/workspace.ts` owns the host workspace. `sandbox-provision.ts` acquires and prepares a provider lease. `sandbox.ts` composes dispatch, attachment and command operations; `operation-gate.ts` enforces exclusive ownership and waits for active work during closure.

`sandbox-dispatch.ts` owns the dispatch transaction: execution, transcript capture, synchronization, journal closure and recovery metadata. `agent-turn.ts` supervises one process; `agent-output.ts` accumulates protocol output; `activity-watchdog.ts` owns timers. Usage aggregation is a domain operation shared by warm and cold execution.

Workspaces and sandboxes retain separate lifetimes. Cold passes allocate separate environments; warm operations reuse a lease. Cancellation, continuation, hook ordering and recovery remain part of the contract.

## Providers and Git

Docker and Podman share the container adapter while preflight, allocation arguments, mounts, invocation and file transfers have separate modules. Vercel and Daytona compose dedicated command and transfer services. Optional SDK loading stays in the corresponding provider entry point.

Git infrastructure separates repository preparation, locking, managed worktree allocation, remote refresh, history collection and lease disposal. Dirty or detached worktrees remain recoverable.

Remote synchronization follows explicit stages: download changes, validate them, back up host state, then apply changes. These services retain overlap checks, concurrent-edit detection and recovery artifacts. The coordinator owns the last synchronized revision and decides whether cleanup is safe.

## Workflows and campaigns

Workflow graph validation, execution state, task retries and dependency scheduling are separate domain services. Task identity controls access to dependency values. Observer errors cannot alter execution outcomes.

Campaign orchestration composes a planner, an issue worker and an integration service. A worker implements and reviews one issue; integration verifies commits before tracker closure. The campaign owns cycle limits and outcome aggregation.

## Extending and validating

To add an agent, implement `AgentAdapter` in its own module, with request and event contracts tested independently. Add a conversation layout or custom store when native continuation is supported. To add a sandbox backend, implement `SandboxProvider` and `SandboxLease`, including cancellation, transfer deadlines and idempotent disposal.

Run `npm run check` for architecture checks, type checking, unit/functional tests and the build. `npm run coverage` enforces 80% lines, branches and functions. Type-only modules are excluded from runtime coverage because TypeScript erases them; type checking and the packed consumer test validate their contracts. CLI command handlers are covered; only the process entry wrapper is excluded.

CI rejects reversed layer dependencies, inline contract declarations, runtime initialization in type modules, chained alternative branches and unused implementation declarations. Multi-platform checks, real Docker/Podman tests and a packed-package consumer exercise the supported boundaries. These checks support architectural review; they do not mechanically prove SRP.
