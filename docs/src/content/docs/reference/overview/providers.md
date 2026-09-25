---
title: "Providers — Overview"
description: "A provider is the backend that allocates an execution environment for a sandbox."
sidebar:
  label: Overview
  order: 0
---

A provider is the backend that allocates an execution environment for a sandbox. It supplies command execution, file transfer and disposal through a lease. Agent protocols remain separate: choosing a different backend does not require rewriting the agent adapter.

## How it works

Docker and Podman use local containers, Vercel and Daytona allocate remote environments, and `local()` explicitly executes on the host. Placement determines how the repository becomes available and how changes return. A provider configuration is reusable; its acquired lease represents one allocated environment.

## Boundaries and responsibilities

Capabilities and isolation guarantees depend on the backend; unsupported operations must be rejected explicitly. Firecracker and `FirecrackerOptions` describe an experimental microVM provider requiring a prepared Linux/KVM host and guest. Its flask icon marks unfinished research work, not a production security guarantee. There is no silent fallback to host execution.

OpenAI-compatible APIs are [model providers](../model-providers/), separate from sandbox backends. `openaiCompatible()` enables experimental direct text calls without Codex; the agent harness is planned for phase two.

## Entry points

- [docker](../../docker/)
- [podman](../../podman/)
- [local](../../local/)
- [vercel](../../vercel/)
- [daytona](../../daytona/)
- [firecracker](../../firecracker/)
- [FirecrackerOptions](../../firecrackeroptions/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)

[Learn with the practical guide](../../../guide/environment/providers/overview/).
