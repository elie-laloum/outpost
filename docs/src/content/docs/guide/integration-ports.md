---
title: "Custom integrations"
description: "Extend one capability without replacing the runtime."
---

Implement the contract that owns the behavior you need. Keep CLI protocols, execution environments and persistence independent.

| Contract                           | Responsibility                                                |
| ---------------------------------- | ------------------------------------------------------------- |
| `AgentAdapter`                     | Build CLI requests, plan credentials and decode events.       |
| `SandboxProvider` / `SandboxLease` | Allocate, invoke, transfer and release.                       |
| `ConversationStore`                | Locate, capture and restore transcripts.                      |
| `ModelProvider`                    | Validate model settings and exchange bounded model messages.  |
| `Transport`                        | Read, list and conditionally mutate versioned binary objects. |
| `TaskQueue`                        | Persist requests and fence worker leases and results.         |

## Add a CLI harness

A `CliHarness` exposes `kind: "cli"` and `bind(model)`, returning an `AgentAdapter`. Compose it with `createAgent({ harness })`. Keep request construction and event decoding separate, declare continuation capabilities honestly and supply a conversation store only if restoration works.

## Add a sandbox provider

Return a lease with `root`, `home`, invocation, upload/download and idempotent release. Preserve exit status after output streams close, process cancellation and binary transfer semantics. `createMountedSandboxProvider()` and `createRemoteSandboxProvider()` help compose the corresponding strategies.

## Validate the integration

Test observable failure behavior, ownership and cleanup. Mock protocol tests cannot establish real mount, terminal or network isolation behavior. Optional vendor SDKs belong behind their integration entry point so importing Outpost’s core stays lightweight.

For repository contributions, the source tree separates domain contracts, application orchestration, adapters, providers, infrastructure and CLI. Follow the repository’s contribution instructions and run the checks relevant to the boundary changed.

API: [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [SandboxProvider](../../reference/sandboxprovider/) · [ConversationStore](../../reference/conversationstore/).
