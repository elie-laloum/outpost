---
title: "Write an agent adapter"
description: "Write an agent adapter — Outpost"
sidebar:
  order: 1
---

Implement `AgentAdapter` to connect a different native CLI without changing sandbox allocation or workflows. Keep command construction and protocol decoding in separate modules as the adapter grows.

```ts
import { agent, type AgentAdapter } from "@elie-laloum/outpost";

const adapter: AgentAdapter = {
  name: "example",
  resumable: false,
  capture: false,
  request(input) {
    if (input.continuation) throw new Error("Continuation is unsupported");
    return {
      executable: "example-agent",
      arguments: ["run", input.text ?? ""],
    };
  },
  events(line) {
    return [{ kind: "text", text: line }];
  },
};
const worker = agent({ harness: { kind: "cli", bind: () => adapter } });
console.log(worker.name);
```

This illustrates the port, not an installed CLI: supply your real executable and protocol. `request(input)` receives optional text, interactive mode and continuation metadata and returns a `Command`. `events(line)` returns zero or more normalized events. Preserve unknown messages as `raw` when they are useful for diagnostics; do not invent token counts or conversation IDs.

## Optional capabilities

`variables` declares adapter environment. `resumable` signals whether response repair can resume a conversation. `storage` supplies a custom `ConversationStore`; `conversations` selects a built-in native format. `capture` controls transcript capture, and `transcriptUsage(text)` can provide authoritative token counts. `requiresFinishedEvent` makes a zero exit fail when the CLI emitted no `finished` event. `credentials(variables)` returns a credential plan (variables, host files to read, generated files and login commands) that Outpost installs once per sandbox before the agent's first command; on the host placement only its variables are forwarded. Built-in adapters use it for the [`authentication`](../../../manual/authentication/) setting.

Emit `conversation` when the CLI provides an ID, `usage` for counters, `result` for an authoritative final answer, and `failure` for protocol failures. `finished` alone is not the configured textual completion marker.

Test request arguments for ordinary, interactive, resume and fork modes; a fresh-session adapter should reject continuations explicitly. Test partial/noisy input, unknown events, cancellation through the provider, and malformed transcripts. An adapter is not responsible for managing workspace cleanup.
