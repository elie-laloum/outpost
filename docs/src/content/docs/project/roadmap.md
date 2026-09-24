---
title: "Roadmap"
description: "Roadmap — Outpost"
sidebar:
  order: 3
---

Roadmap items are planned additions, not requirements for using the current release. They are not delivery-date commitments.

## Available in 3.0.0

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

## Follow-up — efficiency and diagnostics

- Incremental initial uploads and Git history transfers beyond the current untracked-file optimization.
- Complete restoration orchestration, broader resource activity tracking and storage reservations beyond quota admission snapshots.

## Longer term — durable orchestration

- Persisted workflow checkpoints and restart recovery.
- Distributed task queues and worker leases with fencing tokens.
- Approval and pause/resume nodes.
- Typed artifact contracts between isolated tasks, with lineage.
- Native cloud terminals where reliable PTY APIs are available.
- Additional agents through the existing adapter ports.

## Research

Stronger Git metadata isolation for adversarial agents, microVM backends, fine-grained outbound networking and speculative execution with conflict/cost controls.

See the [changelog](../changelog/) for shipped behavior and the [architecture](../architecture/) for the extension boundaries.
