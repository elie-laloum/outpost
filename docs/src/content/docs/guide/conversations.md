---
title: "Conversations"
description: "Continue an agent’s conversation in a later task, branch it into a separate one, and keep it on another machine."
---

## Continue a conversation

`result.resume()` sends a follow-up brief to the conversation a dispatch produced. The agent keeps its context: the files it read, what it decided and what it answered.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const next = await first.resume({
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
```

`resume()` runs a new dispatch in a fresh sandbox with the first one’s settings: repository, sandbox provider, branch. Outpost restores the saved conversation there first. Pass any setting to override it.

## Resume later from its ID

`result.conversation` holds the conversation ID. To resume from another script, pass `continuation: { id }` to `dispatch()`. Outpost finds it in the agent’s store on this host or, once archived through a transport, on any machine.

## Branch a conversation

`result.fork()` starts a new conversation from a copy of the first one. The original stays unchanged, so you can try two directions from the same context. Give the fork its own branch to keep its commits apart.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const alternative = await first.fork({
  branch: { mode: "named", name: "outpost/parser-state-machine" },
  brief: { text: "Rewrite the parser as a state machine and commit it." },
});
console.log(alternative.conversation, alternative.branch);
```

From an ID, `continuation: { id, fork: true }` does the same.

## Continue in an open sandbox

In a [sandbox session](../sandbox-sessions/), `result.resume()` and `result.fork()` continue in the same sandbox, with no restore. They take only brief and turn options: the sandbox settings are fixed.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const plan = await sandbox.dispatch({
  brief: { text: "Propose a fix for the flaky login test. Do not edit files." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
await plan.resume({
  brief: { text: `Apply your fix. Current test output:\n${tests.stdout}` },
});
```

`sandbox.resume(id, options)` and `sandbox.fork(id, options)` take an ID instead, including one captured by an earlier dispatch.

## Which agents support what

Cold means a new sandbox (`dispatch()`, `result.resume()` on a `dispatch()` result); warm means the same open sandbox. [Choose an agent](../choose-an-agent/) compares the other capabilities.

| Agent                           | Cold resume | Warm resume       | Fork |
| ------------------------------- | ----------- | ----------------- | ---- |
| Claude Code, Codex, Kimi        | Yes         | Yes               | Yes  |
| GitHub Copilot CLI              | Yes         | Yes               | No   |
| [Built-in harness](../harness/) | Yes         | Yes               | Yes  |
| Antigravity                     | No          | Same sandbox only | No   |

## Where conversations are stored

After each turn, Outpost copies the conversation from the sandbox to the host. `result.transcript` holds the path of that copy.

| Agent            | Default store                  | Host location                               |
| ---------------- | ------------------------------ | ------------------------------------------- |
| Claude Code      | `createClaudeConversations()`  | `~/.claude/projects/<project>/<id>.jsonl`   |
| Codex            | `createCodexConversations()`   | `~/.codex/sessions/<yyyy>/<mm>/<dd>/`       |
| Copilot CLI      | `createCopilotConversations()` | `.outpost/conversations/copilot/<id>.json`  |
| Kimi Code        | `createKimiConversations()`    | `.outpost/conversations/kimi/<id>.json`     |
| Built-in harness | `createHarnessConversations()` | `.outpost/conversations/harness/<id>.jsonl` |

Copilot and Kimi keep a session as a directory: Outpost packs it into one JSON bundle. The `conversationHome` option of `dispatch()` or `createSandbox()` replaces `~`, or the repository for bundles, as the root of these paths.

Restoring rewrites the repository paths recorded in the conversation to those of the new sandbox. To give a CLI you add its own store, see [Native conversation formats](../conversation-formats/).

## Archive and share through a transport

`createTransportConversations()` wraps an agent’s store and also archives each capture through a [transport](../storage/). A conversation then resumes on another machine, or after the repository’s `.outpost` directory is deleted.

```ts
import {
  createAgent,
  createCodexConversations,
  createCodexHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost";

const conversations = createTransportConversations(createCodexConversations(), {
  transporter: createLocalTransport({ directory: "/mnt/shared/outpost" }),
  namespace: "my-project",
});

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account", conversations }),
});
```

<!-- features -->

- **Matching format**: Wrap the store of the same agent, such as `createHarnessConversations()` for `createHarness()`. A mismatch fails when the harness is created.
  - `conversations`
- **Stable namespace**: Use one project name on every machine that shares these conversations.
  - `namespace`
- **Shared transport**: Use [S3 or R2](../object-storage/) between hosts; a local transport on a shared mount also works.
  - `createS3Transport()`

`result.transcriptReference` identifies the archived copy. The Claude Code, Codex, Copilot and Kimi presets and `createHarness()` accept `conversations`.

## Turn capture off

`saveConversations: false` on Claude Code or Codex keeps conversations inside the sandbox: only a warm resume can continue them. `conversations: false` on `createHarness()` saves no transcript and rejects resume, fork and response repairs. Copilot and Kimi always capture.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    saveConversations: false,
  }),
});
```

## Limits

- **Bundle size**: A Copilot or Kimi session is limited to 64 MiB and 4,096 files. Symlinks, missing required files and files changing during capture fail with code `session`.
- **Kimi state**: Capture leaves out logs, background tasks, cron jobs, notifications and lock files. A resumed session restores the conversation, not running processes or schedules.
- **Antigravity**: Nothing is captured, so it rejects the `conversations` option.
- **No encryption**: Conversations hold prompts, repository content and tool output, stored and archived without encryption or authentication. Restrict access as you would to the repository.
- **Credentials apart**: A conversation carries no credentials. The resuming agent needs its own [authentication](../authentication/), and deleting credentials leaves conversations in place.
- **Host execution**: With [host execution](../host-process/), agents use your own session stores. Kimi refuses to restore a session already there under another workspace.
- **Fallback agents**: A [fallback agent](../fallback-agents/) takes no `continuation`. `result.resume()` continues with the candidate that answered.

API: [DispatchResult](../../reference/dispatchresult/) · [WarmDispatchResult](../../reference/warmdispatchresult/) · [Sandbox](../../reference/sandbox/) · [ConversationStore](../../reference/conversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [createKimiConversations](../../reference/createkimiconversations/) · [createHarnessConversations](../../reference/createharnessconversations/).
