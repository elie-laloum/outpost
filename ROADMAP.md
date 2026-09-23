# Roadmap

## V1 contract

Reusable sandboxes; independent workspaces; current/named/integration branch policies; Claude Code and Codex adapters; native session capture, resume and fork; Docker, Podman, host, Vercel and Daytona providers; command streaming and cancellation; file prompts, expansion, loops and structured responses; setup hooks; typed workflows; CLI initialization; EN/FR documentation; cross-platform tests and package release automation.

## V1.x: efficiency and diagnostics

- Incremental remote file manifests and compressed transfer batches while preserving recovery guarantees.
- Content-addressed dependency caches and prebuilt agent images with signed provenance.
- Configurable recovery retention with an inspect/prune CLI and storage quotas.
- Structured metrics, OpenTelemetry integration and per-workflow usage budgets.
- Richer diagnostic reports for provider capabilities and agent CLI compatibility.
- More hosted-provider contract fixtures and scheduled live compatibility checks.

## V2: durable orchestration

- Persisted workflow checkpoints and recovery after host restarts.
- Distributed task queues and worker leases with fencing tokens.
- Explicit approvals and pause/resume nodes in workflows.
- Artifact contracts between isolated tasks, with typed validation and lineage.
- Native terminal transport for cloud backends where reliable PTY APIs are available.
- Additional agent adapters through the existing domain ports.

## Research

- Stronger Git metadata isolation for adversarial agents.
- MicroVM backends and fine-grained outbound network policies.
- Speculative execution with conflict-aware integration and cost limits.

Roadmap items are additions to the v1 contract. They are not prerequisites for running the current library.
