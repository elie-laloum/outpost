---
title: "Providers — Overview"
description: "A provider is the backend that allocates an execution environment for a sandbox."
sidebar:
  label: Overview
  order: 0
---

A provider is the backend that allocates an execution environment for a sandbox. It supplies command execution, file transfer and disposal through a lease. Agent protocols remain separate: choosing a different backend does not require rewriting the agent adapter.

## How it works

Docker and Podman use local containers, Vercel and Daytona allocate remote environments, and `localSandboxProvider()` explicitly executes on the host. Placement determines how the repository becomes available and how changes return. A provider configuration is reusable; its acquired lease represents one allocated environment.

`SandboxLease.fileTransfers` exposes optional transfer capabilities through `FileTransfers`; `FileManifestEntry` describes files used for comparison and verification. Providers can support incremental payload reuse and bounded batches. Repository synchronization combines these capabilities with Git history and host-state checks. See the [remote transfers guide](../../../guide/operations/remote-transfers/) for practical usage.

## Boundaries and responsibilities

Capabilities and isolation guarantees depend on the backend; unsupported operations must be rejected explicitly. Firecracker and `FirecrackerOptions` describe an experimental microVM provider requiring a prepared Linux/KVM host and guest. Its flask icon marks unfinished research work, not a production security guarantee. There is no silent fallback to host execution.

OpenAI-compatible APIs are [model providers](../model-providers/), separate from sandbox backends. `openaiModelProvider()` enables experimental direct text calls without Codex; the agent harness is planned for phase two.

`EgressPolicy` configures outbound network access independently of agent prompts. The provider validates and applies the requested restrictions during environment setup. These opt-in research capabilities depend on backend support; unsupported policies are rejected explicitly. Network controls do not replace repository isolation or credential scoping. See the [outbound networking guide](../../../guide/advanced/egress/) for supported modes and verification.

Transfers must preserve binary contents and supported file properties. A digest verifies integrity, not the identity of the data supplier. Incoming changes must not silently overwrite concurrent host edits; conflicts and interrupted synchronization can retain recovery data for inspection.

## Entry points

- [docker](../../docker/)
- [podman](../../podman/)
- [local](../../local/)
- [vercel](../../vercel/)
- [daytona](../../daytona/)
- [firecracker](../../firecracker/)
- [FirecrackerOptions](../../firecrackeroptions/)
- [EgressPolicy](../../egresspolicy/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)
- [TransferOptions](../../transferoptions/)
- [FileTransfers](../../filetransfers/)
- [FileManifestEntry](../../filemanifestentry/)

[Learn with the practical guide](../../../guide/environment/providers/overview/).
