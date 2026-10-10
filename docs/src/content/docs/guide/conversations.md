---
title: "Continue a conversation"
description: "Resume an agent’s saved context or start a separate conversation from it."
---

After a [successful first task](../first-request/), continue its conversation for a follow-up request. Keep the branch or files separately: a saved conversation preserves the discussion, not a running process or a copy of every workspace file.

## Continue a conversation

Call `result.resume()` to send a follow-up request to the conversation created by a dispatch. The saved context includes the earlier messages, so the agent can continue from its previous work.

```ts
import { writeFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
if (!first.conversation) throw new Error("No portable conversation captured");
await writeFile("conversation-id.txt", first.conversation);
const next = await first.resume({
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
// Example output: Add a regression test for empty parser input.
```

The follow-up runs in a fresh sandbox with the same repository, provider and branch settings. Outpost restores the saved conversation before starting the agent. You can override these settings in the `resume()` request.

## Resume later from its ID

`result.conversation` holds the conversation ID. To resume from another script, pass `continuation: { id }` to `dispatch()`. Outpost finds it in the agent’s store on this host or, once archived through a transport, on any machine.

Save `first.conversation` in `conversation-id.txt` after the first call. The following script reads that ID; use the same repository and branch as the original run.

```ts title="resume-conversation.ts"
import { readFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const id = (await readFile("conversation-id.txt", "utf8")).trim();
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  continuation: { id },
  brief: { text: "Summarize the edge cases you found earlier." },
});
console.log(result.text);
```

Run `node resume-conversation.ts`. The answer uses the saved context. An archived conversation does not transport the worktree: make its files available too before resuming.

## Branch a conversation

Use `result.fork()` to explore another approach from the same saved context. It starts a separate conversation and leaves the original unchanged. Give the fork its own branch when its commits need to stay separate.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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
// Example output: session-2 outpost/parser-state-machine
```

From an ID, `continuation: { id, fork: true }` does the same.

## Continue in an open sandbox

In a [sandbox session](../sandbox-sessions/), `result.resume()` and `result.fork()` continue in the same sandbox, with no restore. They take only brief and turn options: the sandbox settings are fixed.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

<span id="where-conversations-are-stored"></span>
<span id="archive-and-share-through-a-transport"></span>
<span id="turn-capture-off"></span>

For this step, follow [Store and share conversations](../conversation-storage/).

## Limits

- **Bundle size**: A Copilot or Kimi session is limited to 64 MiB and 4,096 files. Symlinks, missing required files and files changing during capture fail with code `session`.
- **Kimi state**: Capture leaves out logs, background tasks, cron jobs, notifications and lock files. A resumed session restores the conversation, not running processes or schedules.
- **Antigravity**: Nothing is captured, so it rejects the `conversations` option.
- **No encryption**: Conversations hold prompts, repository content and tool output, stored and archived without encryption or authentication. Restrict access as you would to the repository.
- **Credentials apart**: A conversation carries no credentials. The resuming agent needs its own [authentication](../authentication/), and deleting credentials leaves conversations in place.
- **Host execution**: With [host execution](../host-process/), agents use your own session stores. Kimi refuses to restore a session already there under another workspace.
- **Fallback agents**: A [fallback agent](../fallback-agents/) takes no `continuation`. `result.resume()` continues with the candidate that answered.

API: [DispatchResult](../../reference/dispatchresult/) · [WarmDispatchResult](../../reference/warmdispatchresult/) · [Sandbox](../../reference/sandbox/) · [ConversationStore](../../reference/conversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [createKimiConversations](../../reference/createkimiconversations/) · [createHarnessConversations](../../reference/createharnessconversations/).

## Resume a routed harness

[Model routing](../model-routing/) records each effective selection in version-2 transcripts while retaining the `harness` storage format. Version-1 transcripts remain readable and are upgraded when routing is enabled on continuation. Resume and fork restore messages; the next step evaluates the router again without replaying completed model or tool calls. Journal replay emits recorded selections without contacting Jev or Laya.
