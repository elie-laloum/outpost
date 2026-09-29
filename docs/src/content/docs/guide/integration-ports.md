---
title: "Integration ports"
description: "Six contracts plug another agent CLI, sandbox, model API, store or queue into Outpost. You implement one; Outpost keeps running everything around it."
---

## Pick the port

Each port owns one responsibility. Implement the one that matches what you want to plug in.

<!-- features -->

- [Add a CLI agent](../custom-agents/): Build the command that starts the CLI and decode its output lines.
  - `CliHarness`
  - `AgentAdapter`
- [Native conversation formats](../conversation-formats/): Find, capture and restore the transcripts a CLI writes.
  - `ConversationStore`
- [Add a sandbox provider](../custom-sandbox-providers/): Allocate an environment, run commands, transfer files, release it.
  - `SandboxProvider`
  - `SandboxLease`
- [Model providers](../model-providers/): Send the built-in harness’s requests to a model API.
  - `ModelProvider`
- [Where data lives](../storage/): Read, list and conditionally write versioned bytes for every durable store.
  - `Transport`
- [Job queues](../job-queues/): Persist jobs, fence worker leases and keep their results.
  - `TaskQueue`

## Swap one port, keep the rest

Ports do not know each other. An adapter only builds a command and reads lines; any sandbox runs it. A provider runs commands without knowing which agent sent them.

```ts
import { createAgent, dispatch, type AgentAdapter } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const mycli: AgentAdapter = {
  name: "mycli",
  request: ({ text }) => ({
    executable: "mycli",
    arguments: ["--json"],
    stdin: text ?? "",
  }),
  events: (line) => [{ kind: "text", text: line }],
};

await dispatch({
  agent: createAgent({ harness: { kind: "cli", bind: () => mycli } }),
  sandboxProvider,
  repository,
  brief: { text: "Summarize the README." },
});
```

Moving this agent to your own sandbox changes only `sandboxProvider`. Storing checkpoints in your own backend changes only the `transporter` of the stores.

## What Outpost keeps doing

Your implementation stays small because the runtime around it does not change.

<!-- features -->

- **Process supervision**: Waits for the exit status, bounds the output and stops idle agents.
- **Cancellation**: Passes signals and deadlines to commands, transfers and model requests.
- **Retries and repairs**: Task retries, typed-response repairs, [quota pauses](../quota-pauses/) and [fallback](../fallback-agents/).
- **Observation**: Forwards decoded events to observers and journals, and adds up token usage.
- **Workspace and Git**: Worktrees, branch locks, integration and synchronization back to the host.
- **Agent home**: Installs the adapter’s credential and configuration plans in the sandbox’s private home.

## Validate an integration

Test what a user observes when things go wrong: a nonzero exit status, output that closes before the process, a cancelled or timed-out run, a release called twice. Check who owns each resource and that temporary files disappear on success, failure and cancellation.

For a sandbox provider, `diagnose()` runs a bounded probe against a real sandbox: Node.js, Git, separate output streams, a nonzero exit status, the home directory and, with `transfers`, binary file transfers.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({ sandboxProvider, repository });
const report = await sandbox.diagnose({ transfers: true });
console.log(report.hasFailures, report.checks);
```

:::caution
Mock tests prove the protocol, not the environment. Mounts, tmpfs, terminals and network isolation need a test against the real engine.
:::

## Ship optional SDKs separately

Load a vendor SDK only from your integration’s own entry point, and declare it as an optional peer dependency. Outpost does the same: `@elie-laloum/outpost/providers/vercel`, `/transports/s3` and `/queues/bullmq` load their SDKs, the core import does not.

To contribute a built-in agent or provider to Outpost itself, follow `AGENTS.md` in the [repository](https://gitlab.elielaloum.com/elielaloum/outpost).

API: [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [ConversationStore](../../reference/conversationstore/) · [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [ModelProvider](../../reference/modelprovider/) · [Transport](../../reference/transport/) · [TaskQueue](../../reference/taskqueue/) · [diagnoseSandbox](../../reference/diagnosesandbox/).
