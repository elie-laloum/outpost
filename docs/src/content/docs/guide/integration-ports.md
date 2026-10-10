---
title: "Extend Outpost"
description: "Find the contract to implement when adding an agent, sandbox, model service, store or queue."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="replace-one-integration"></span>
<span id="what-outpost-keeps-doing"></span>

## Choose a contract to implement

Choose the contract that matches the integration you want to add. Each contract has one responsibility, so you can implement an agent adapter, sandbox provider or storage transport without replacing the rest of Outpost.

<!-- features -->

- [Add a CLI agent](../custom-agents/): Build the command that starts the CLI and decode its output lines.
- [Native conversation formats](../conversation-formats/): Find, capture and restore the transcripts a CLI writes.
- [Add a sandbox provider](../custom-sandbox-providers/): Allocate an environment, run commands, transfer files, release it.
- [Model providers](../model-providers/): Send the built-in harness’s requests to a model API.
- [Where data lives](../storage/): Read, list and conditionally write versioned bytes for every durable store.
- [Job queues](../job-queues/): Persist jobs, fence worker leases and keep their results.
- [Secret sources](../secret-sources/): Resolve declared names on the host before allocating a sandbox.

## Validate an integration

Test what a user observes when things go wrong: a nonzero exit status, output that closes before the process, a cancelled or timed-out run, a release called twice. Check who owns each resource and that temporary files disappear on success, failure and cancellation.

For a sandbox provider, `diagnose()` runs a bounded probe against a real sandbox: Node.js, Git, separate output streams, a nonzero exit status, the home directory and, with `transfers`, binary file transfers.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ sandboxProvider, repository });
const report = await sandbox.diagnose({ transfers: true });
console.log(report.hasFailures, report.checks);
// Example output: false [ { id: "sandbox.node", status: "pass", … }, … ]
```

:::caution
Mock tests prove the protocol, not the environment. Mounts, tmpfs, terminals and network isolation need a test against the real engine.
:::

## Keep optional dependencies separate

Load a vendor SDK only from your integration’s own entry point, and declare it as an optional peer dependency. Outpost does the same: `@elie-laloum/outpost/providers/vercel`, `/transports/s3` and `/queues/bullmq` load their SDKs, the core import does not.

To contribute a built-in agent or provider to Outpost itself, follow `AGENTS.md` in the [repository](https://gitlab.elielaloum.com/elielaloum/outpost).

API: [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [ConversationStore](../../reference/conversationstore/) · [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [ModelProvider](../../reference/modelprovider/) · [Transport](../../reference/transport/) · [TaskQueue](../../reference/taskqueue/) · [diagnoseSandbox](../../reference/diagnosesandbox/).

## Connect decision services

[`DecisionProvider`](../../reference/decisionprovider/) evaluates typed questions over lossless JSON state. It is independent of `ModelProvider` and allocates no sandbox. Use the common System One HTTP adapter for Jev and compatible Laya endpoints, or implement one cancellable request returning native answers and available usage. See [typed decisions](../decisions/) and [per-step routing](../model-routing/).
