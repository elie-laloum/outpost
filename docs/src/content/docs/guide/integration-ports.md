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

Only `name`, `request()` and `events()` are required. Each optional member enables one capability: `resumable`, `forkable` and `fork()` for continuation, `storage` for portable conversations, `credentials()` and `configuration()` for the agent home, `quota()` and `unavailable()` for [fallback](../agent-fallback/) and quota pauses, `usage` for token accounting and `liveInput` for [steering](../steering/) a running turn. Outpost supervises the process, sandbox, cancellation and retries the same way for every adapter.

## Native conversation formats

An external CLI gets native capture, cold resume and transport archiving by returning a native store as `storage`. Two building blocks cover the usual layouts; the built-in Claude, Codex, Copilot and Kimi stores are made from them.

`createTranscriptConversations()` handles CLIs that keep one JSONL transcript per conversation. The layout tells Outpost where to find the transcript on the host and in the sandbox:

```ts
import { basename, join, posix } from "node:path";
import {
  createAgent,
  createTranscriptConversations,
  type AgentAdapter,
} from "@elie-laloum/outpost";

const sessions = (home: string) => join(home, ".mycli", "sessions");

const adapter: AgentAdapter = {
  name: "mycli",
  resumable: true,
  storage: createTranscriptConversations({
    format: "mycli",
    sidecars: false,
    searchRoot: sessions,
    remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
    pattern: (id) => `${id}.jsonl`,
    matches: (file, id) => basename(file) === `${id}.jsonl`,
    directory: (_repository, home) => sessions(home),
    capturePath: (id, _repository, home) => join(sessions(home), `${id}.jsonl`),
    remotePath: (id, sandbox) =>
      posix.join(sandbox.home, ".mycli", "sessions", `${id}.jsonl`),
  }),
  request: ({ text, continuation }) => ({
    executable: "mycli",
    arguments: [
      "--json",
      ...(continuation ? ["--resume", continuation.id] : []),
    ],
    stdin: text ?? "",
  }),
  events: (line) => {
    const event = JSON.parse(line);
    if (event.session) return [{ kind: "conversation", id: event.session }];
    return [{ kind: "text", text: String(event.text ?? "") }];
  },
};

export const agent = createAgent({
  harness: { kind: "cli", bind: () => adapter },
});
```

Capture and restoration rewrite recorded `cwd` values that equal the original workspace, so the transcript follows the repository into another sandbox.

`createSessionBundleConversations()` handles CLIs that keep each session as a directory. Its profile names the CLI home and session directory, selects files with regular expressions and lists the files a session cannot lack. A script run inside the sandbox packs the session into one JSON bundle, limited to 64 MiB and 4,096 files, and refuses symlinks and files that change during capture. Restoration stages every file and keeps any previous session under `.outpost-recovery/`.

`validate`, `bucket` and `relocate` run inside the sandbox from their source text. Write them as self-contained arrow or function expressions: they cannot use imports or variables from your module, only their arguments and the `helpers` Outpost passes. A method or a regular expression with the `g` or `y` flag is rejected when the store is created; a reference to an outer variable fails when a session is captured.

Keep `format` stable once conversations are captured: it names conversation records, transport keys and bundle directories. Wrap the store with `createTransportConversations()` to archive it like a built-in format.

## Add a sandbox provider

Return a lease with `root`, `home`, invocation, upload/download and idempotent release. Preserve exit status after output streams close, process cancellation and binary transfer semantics. `createMountedSandboxProvider()` and `createRemoteSandboxProvider()` help compose the corresponding strategies.

## Validate the integration

Test observable failure behavior, ownership and cleanup. Mock protocol tests cannot establish real mount, terminal or network isolation behavior. Optional vendor SDKs belong behind their integration entry point so importing Outpost’s core stays lightweight.

For repository contributions, the source tree separates domain contracts, application orchestration, adapters, providers, infrastructure and CLI. Each built-in agent lives in its own `src/adapters/agents/<agent>/` folder with a descriptor registered in the agent catalog, from which `outpost init`, `outpost doctor`, remote bootstrap and the generated image derive. Follow the repository’s contribution instructions and run the checks relevant to the boundary changed.

API: [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [SandboxProvider](../../reference/sandboxprovider/) · [ConversationStore](../../reference/conversationstore/) · [createTranscriptConversations](../../reference/createtranscriptconversations/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/).
