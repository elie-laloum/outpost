---
title: "Write a sandbox provider"
description: "Write a sandbox provider — Outpost"
sidebar:
  order: 2
---

Implement `SandboxProvider` and return a `SandboxLease` from `acquire(context)`. The provider owns environment allocation; the lease owns command execution, transfers and disposal.

`SandboxContext` supplies host `repository`, selected worktree `directory`, required `gitDirectories`, declared `variables` and an optional provisioning `signal`. Do not silently expose additional host directories.

| Lease member                              | Required behavior                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `root`, `home`                            | Actual execution-side workspace and agent-home paths.                                          |
| `invoke(command)`                         | Honor directory, environment, stdin, output observation, retention, deadline and cancellation. |
| `upload(source, destination, options?)`   | Transfer host files/directories to the environment.                                            |
| `download(source, destination, options?)` | Transfer environment files/directories to the host.                                            |
| `release()`                               | Idempotent cleanup, including pending process/session resources.                               |

Choose placement deliberately: `mounted` shares the worktree, `remote` uses Git synchronization, and `host` executes directly. The `mountedSandboxProvider({ name, variables?, acquire })` and `remoteSandboxProvider(...)` factories add the placement and freeze the provider definition; they do not implement transport for you.

Transfers receive optional `signal` and `deadlineMs`. Support binary data and nested directories. Stop active command groups on cancellation without destroying a reusable environment. If interactive execution or elevation is unsupported, reject it explicitly rather than pretending it succeeded.

Write contract tests for allocation failure, invocation after release, repeated release, nonzero status, streaming, output limits, binary transfer and cancellation cleanup. Cloud SDK types should stay in the provider adapter; domain contracts should not depend on them.
