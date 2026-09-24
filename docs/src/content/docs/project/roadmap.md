---
title: "Roadmap"
description: "Roadmap — Outpost"
sidebar:
  order: 3
---

Roadmap items are planned additions, not requirements for using the current release. They are not delivery-date commitments.

## Available in 2.0.0

Reusable sandboxes and independent Git workspaces; Claude Code and Codex adapters; native conversation capture, resume and fork; Docker, Podman, local, Vercel and Daytona providers; prompts, iteration, structured responses and hooks; typed workflows; setup CLI, bilingual documentation and automated package releases.

Version 2.0.0 adds standalone workflow projects with `init --repository`, script-relative repository, brief and environment paths, live agent progress and cancellation recovery details. Typed workflows can coordinate independent repositories through isolated tasks. Issue campaigns and backlog connectors have been removed; initialization generates a dispatch starter.

## Implemented on main — unreleased

Host diagnostics with `outpost doctor`: Node.js, Git, Docker/Podman access, host agent versions, provider contract summary and JSON reports. The optional `--image` check starts and cleans up a temporary Docker/Podman sandbox and checks its agent version without network or model access. It also checks start/resume/fork command help and the option names used by the default headless adapters. See [host diagnostics](../../operations/doctor/) for the checks and limitations.

Read-only [recovery storage inspection](../../operations/recovery/#inspect-retained-storage) reports retained files and logical sizes, with traversal limits and explicit partial results. Resource activity and recovery integrity remain unverified.

## Next — efficiency and diagnostics

- Incremental remote file manifests and compressed transfer batches with recovery guarantees.
- Dependency caches and prebuilt agent images with signed provenance.
- Recovery integrity and activity checks, explicit pruning, retention configuration and storage quotas.
- Structured metrics, OpenTelemetry integration and per-workflow usage budgets.
- Diagnostics of existing workflow sandboxes, cloud capability probes and agent protocol compatibility reports.
- Additional hosted-provider fixtures and scheduled live compatibility checks.

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
