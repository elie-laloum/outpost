---
title: "Roadmap"
description: "Roadmap — Outpost"
sidebar:
  order: 3
---

Roadmap items are planned additions, not requirements for using the current release. They are not delivery-date commitments.

## Foundation available through 3.0.0

Reusable sandboxes and independent Git workspaces; Claude Code and Codex adapters; native conversation capture, resume and fork; Docker, Podman, local, Vercel and Daytona providers; prompts, iteration, structured responses and hooks; typed workflows; setup CLI, bilingual documentation and automated package releases.

Version 2.0.0 introduced standalone workflow projects with `init --repository`, script-relative repository, brief and environment paths, live agent progress and cancellation recovery details. Typed workflows can coordinate independent repositories through isolated tasks. Issue campaigns and backlog connectors have been removed; initialization generates a dispatch starter.

## Added in 3.0.0

This major version extends public TypeScript contracts: custom implementations of `Sandbox`, `TaskContext` and `WorkflowResult` must provide the new diagnostic and usage members. Exhaustive observers must accept `attempt` and `usage`. See the [changelog](../changelog/) for adaptations and behavioral changes.

Host diagnostics with `outpost doctor`: Node.js, Git, Docker/Podman access, host agent versions, provider contract summary and JSON reports. The optional `--image` check starts and cleans up a temporary Docker/Podman sandbox and checks its agent version without network or model access. It also checks start/resume/fork command help and the option names used by the default headless adapters. See [host diagnostics](../../operations/doctor/) for the checks and limitations.

Read-only [recovery inspection](../../operations/recovery/) covers inventory, Git workspace state and local lock observations. New Linux locks include host, boot, namespace and process-start identity; uncertain ownership prevents automatic reclamation. [Verification](../../operations/recovery-verification/) checks retained structures, unsigned SHA-256 manifests and, on request, Git objects and independent patch applicability in an isolated copy. [Retention policies](../../operations/storage-retention/) provide dry runs, explicit revalidated pruning of eligible workspaces and closed logs, and quota admission observations. Recovery artifacts and uncertain resources remain protected.

[Remote transfers](../../operations/remote-transfers/) use incremental SHA-256 manifests and bounded compressed batches for Vercel/Daytona untracked file downloads. Verified unchanged host files are reused while every recovery attempt retains its own complete incoming payload. Initial uploads, tracked patches and self-contained Git bundles retain their existing paths.

[Dependency caches](../../providers/dependency-caches/) are opt-in Docker/Podman volumes with explicit invalidation keys. [Agent-image tooling](../../providers/agent-images/) builds pinned inputs and provides a gated publication workflow with signed provenance verification. Image publication and signature verification must still run in the configured release environment; adding the workflow does not publish an image.

[Workflow events and metrics](../../operations/telemetry/) feed an optional OpenTelemetry integration with injected tracer and meter. [Budgets](../../workflows/budgets/) limit task attempt admissions and observed usage across retries and concurrent tasks; they do not guarantee billing caps.

[Advanced diagnostics](../../operations/doctor/) inspect an existing sandbox under exclusive ownership, with optional binary transfer probes and cleanup. Bundled protocol checks are offline structural fixtures; they do not certify authenticated model behavior.

[Cloud tests](../../operations/cloud-compatibility/) add deterministic fixtures and an explicitly enabled scheduled/manual Vercel/Daytona campaign with credentials and sanitized reports. Live checks still need execution in configured accounts; model calls are explicitly outside this suite.

## Available in 4.0.0

Version 4.0.0 adds the capabilities below. Its extended public workflow status unions require exhaustive consumers to handle task statuses `paused` and `rejected`, and workflow result status `paused`. The research prototypes in the following section are shipped on explicit opt-in, with their documented limits; publication does not establish live cloud, microVM or signed-image validation.

- [Storage reservations](../../operations/storage-retention/) coordinate cooperating local writers and can follow workspace ownership. [Resource activity](../../operations/recovery/) records locally observed sandboxes, operations and cleanup; it does not enumerate remote accounts.
- [Recovery restoration](../../operations/recovery-restoration/) reconstructs retained previous or incoming state in a new isolated directory after integrity and Git checks. It does not restore ignored files, submodule repositories, provider state or conversations.
- [Uploads](../../operations/remote-transfers/) batch and verify file/symlink inputs; directory copies retain their existing path. [Git transfers](../../sandboxes/remote-sync/) use verified delta history when possible while recovery keeps complete bundles and local validation still processes full history.
- [Checkpoints](../../workflows/checkpoints/) persist JSON task outputs and usage with explicit retry of incomplete tasks. [Approval and pause gates](../../workflows/approvals/) persist requests and decisions; declared actors are trusted metadata, not authentication.
- [Typed artifacts](../../workflows/artifacts/) provide validated values, immutable storage and unsigned lineage. [Durable queues](../../workflows/distributed/) use SQLite and optional HTTP workers with fenced leases, shared-token trust and external TLS. Retries can repeat side effects; terminal usage is delayed and receipt metadata prevents double accounting.
- [Daytona terminals](../../providers/daytona/) use its native PTY API. Deterministic tests cover the adapter; live account validation remains required. Vercel still rejects interactive attachment.
- [Gemini CLI](../../agents/gemini/) adds an adapter, bootstrap, generated-image installation and diagnostics pinned to 0.61.0. Only fresh sessions are supported: no native transcript capture, resume, fork or automatic response repairs.
- [Cloud reports](../../operations/cloud-compatibility/) attribute results to source commit, runtime and execution time. [Image publication](../../providers/agent-images/) retains successful signature-verification evidence. These workflows do not establish that a live campaign or signed publication has run.

## Opt-in research prototypes in 4.0.0

- [Isolated Docker/Podman repositories](../../providers/repository-isolation/) avoid mounting host checkout and Git metadata. They remain container boundaries with explicit mount, cache and host-trust limits.
- [Firecracker](../../providers/firecracker/) requires prepared Linux KVM, TAP, a guest image and SSH. It has simulated tests and an opt-in live fixture; no real boot evidence is established here. Jailer integration, cgroups, snapshots, performance and adversarial testing remain unfinished.
- [Outbound policies](../../sandboxes/egress/) support container deny-all and Vercel domain/CIDR policies. Other providers reject unsupported policy requests. Container allowlists, dynamic updates, traffic auditing and finer filtering remain research.
- [Speculative candidates](../../workflows/speculation/) race bounded branches from a pinned base, select a validated and cleaned-up winner and apply observed usage budgets. They never integrate automatically; host comparisons are advisory. Durable race recovery and stronger conflict/cost guarantees remain unfinished.

## Remaining validation and production work

Real cloud command, transfer, firewall and Daytona PTY campaigns require configured accounts and explicit execution; deterministic fixtures do not replace them. Signed image publication and provenance verification require a successful configured publication run. Real Firecracker boot and production hardening remain separate work. Real Docker/Podman and PTY checks are part of release CI. Authenticated model behavior requires separate validation; credential-free CLI checks do not establish it.

See the [changelog](../changelog/) for version boundaries and the [architecture](../architecture/) for extension contracts. No roadmap item is a delivery-date commitment.
