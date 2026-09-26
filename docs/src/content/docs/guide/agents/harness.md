---
title: Build a custom harness (experimental)
description: Compose a model provider, tools, instructions and limits into an agent that Outpost drives itself.
---

:::caution[Experimental API]
The built-in harness engine is experimental since 5.0.0: its contracts may still change, and it has not yet been validated against every model service.
:::

`claudeHarness()`, `codexHarness()` and `geminiHarness()` delegate the whole task to a CLI that runs its own model and tool loop. `harness()` builds that loop in Outpost instead. You declare what the agent can use, and Outpost drives the model:

- a **model provider**, such as `anthropicModelProvider()` or `openaiModelProvider()`;
- **tools** created with `defineHarnessTool()` and grouped with `defineHarnessToolset()`;
- **instructions**, fixed text or resolved when the task starts with `defineHarnessInstructions()`;
- **limits** on steps, tool calls and tokens, and how tools execute;
- **hooks** and **permissions** that control the loop with `defineHarnessHook()` and `defineHarnessPermissions()`.

The result is used like any other agent: `agent({ harness, model })`, then `dispatch()`, a warm sandbox or a workflow task.

## Run a harness with a tool

<details>
<summary>Complete preparation and executable example</summary>

Use Node.js 24+, npm and Git. In a new directory, install Outpost and create a repository with one file:

```sh
mkdir harness-example
cd harness-example
npm init -y
npm install @elie-laloum/outpost
git init
echo "# Demo" > README.md
git add README.md
git -c user.name=Example -c user.email=example@example.test commit -m "Initial"
```

The example uses a scripted model provider so it runs offline and without cost. It answers like a model would: first a tool call, then a final answer built from the tool result.

Save **example.mts**:

```ts file=example.mts
import {
  agent,
  defineHarnessInstructions,
  defineHarnessTool,
  dispatch,
  harness,
  type ModelProvider,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const listFiles = defineHarnessTool({
  name: "list_files",
  description: "List the files tracked by Git in the repository.",
  readOnly: true,
  input: { type: "object", properties: {}, additionalProperties: false },
  async execute(_input, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "git",
      arguments: ["ls-files"],
      signal,
    });
    if (result.status !== 0) return { content: result.stderr, isError: true };
    return result.stdout;
  },
});

const scripted: ModelProvider = {
  name: "scripted",
  async request({ messages = [] }) {
    const last = messages.at(-1)?.content[0];
    if (last?.type !== "tool-result")
      return {
        text: "",
        content: [
          { type: "tool-call", id: "call-1", name: "list_files", input: {} },
        ],
        stopReason: "tool-calls",
      };
    const text = `Tracked files: ${last.content.trim()}\n<outpost>done</outpost>`;
    return { text, content: [{ type: "text", text }], stopReason: "end" };
  },
};

const explorer = agent({
  model: "scripted-model",
  harness: harness({
    modelProvider: scripted,
    instructions: defineHarnessInstructions(
      ({ sandbox }) => `Work in ${sandbox.root}. Use tools before answering.`,
    ),
    tools: [listFiles],
    limits: { maxSteps: 5 },
  }),
});

const result = await dispatch({
  repository: import.meta.dirname,
  sandboxProvider: localSandboxProvider(),
  agent: explorer,
  brief: { text: "Which files are tracked?" },
  observe(event) {
    if (event.kind === "tool" || event.kind === "tool-result")
      console.log(event.kind, event.name);
  },
});
console.log(result.text);
```

Run `node example.mts`. It prints `tool list_files`, `tool-result list_files`, then `Tracked files: README.md` followed by the completion marker. `localSandboxProvider()` runs the tool on the host without isolation; use a container provider for untrusted work.

</details>

## Use a real model

Replace the scripted provider with a model provider, and set the model settings on the agent. The Anthropic provider requires `maxOutputTokens`:

```ts
import {
  agent,
  anthropicModelProvider,
  harness,
  type HarnessTool,
} from "@elie-laloum/outpost";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY");
const tools: HarnessTool[] = [];

export const reviewer = agent({
  model: {
    name: "claude-sonnet-5",
    reasoning: "high",
    maxOutputTokens: 16_000,
  },
  harness: harness({
    modelProvider: anthropicModelProvider({ apiKey }),
    instructions: "You review code changes. Run the tests before concluding.",
    tools,
    limits: { maxSteps: 30, usage: { output: 200_000 } },
  }),
});
```

API calls are billed to that key; CLI subscriptions are not used. The provider runs in the Outpost process, so the key never enters the sandbox. Model calls do not go through the sandbox egress policy.

## Declare tools

A tool has a unique name, a description the model reads, an input schema and an `execute` function. Describe the input with either:

- a **JSON Schema object**. Outpost validates it with a built-in subset: `type`, `properties`, `required`, `additionalProperties`, `items`, `enum`, `const`, `minLength`, `maxLength`, `minimum`, `maximum`, `minItems`, `maxItems`, `title` and `description`. Other keywords are rejected when the tool is defined. Annotate the input type of `execute` yourself.
- a **Standard Schema that exposes JSON Schema**, such as Zod 4. Its validator checks the input and its converter produces the schema sent to the model; the input type is inferred.

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
import { z } from "zod";

export const readFile = defineHarnessTool({
  name: "read_file",
  description: "Read a UTF-8 file relative to the repository root.",
  readOnly: true,
  input: z.object({ path: z.string().min(1) }),
  async execute({ path }, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "cat",
      arguments: ["--", path],
      signal,
    });
    return result.status === 0
      ? result.stdout
      : { content: result.stderr, isError: true };
  },
});
```

`execute` receives the validated input and a context with the borrowed `sandbox`, a `signal`, the `callId`, the agent `model` and `observe()`. Return text, or `{ content, isError }` to report a failure the model can react to. `observe()` accepts `text`, `warning` and `raw` events only; Outpost emits the loop events itself.

`defineHarnessToolset({ name, tools })` groups tools, including other toolsets, so a set can be shared between harnesses. Tool names must stay unique across the whole harness. Outpost also provides [toolsets to read, search, edit, run commands and inspect Git](../harness-toolsets/).

## Loop, stop reasons and limits

Each step is one model request. Outpost sends the instructions, the conversation so far and the tool list, then acts on the stop reason:

| Stop reason  | Outpost behavior                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `end`        | Returns the text as the turn result. Dispatch then checks completion markers and structured responses. |
| `tool-calls` | Validates and runs every call, sends all results in one message, then starts the next step.            |
| `max-tokens` | Fails with code `limit`. Truncated tool calls are never executed.                                      |
| `refusal`    | Fails with code `response`.                                                                            |

`limits` bound the loop: `maxSteps` (default 100), `maxToolCalls` and `usage`, a token budget with `input`, `cached`, `cacheCreated` or `output`. Reaching a limit fails the turn with an `OutpostError` whose code is `limit` and whose `details.limit` names it; it never counts as a success. Usage is known only after each response, so the budget is checked before each new request and the last step can exceed it. A usage limit requires a provider that reports usage.

By default the harness asks the provider to cache the conversation prefix (`cache: true`). Keep instructions and tools stable to benefit from it.

## Tool execution

`toolExecution` controls how calls run:

- `concurrency` (default 4): tools marked `readOnly` run in parallel up to this number. Other tools run one at a time, in call order. Results always return in call order.
- `deadlineMs` (default 300,000): per-call deadline. The call's sandbox commands are cancelled, and the timeout is returned to the model as an error.
- `onError` (default `"return-to-model"`): an unknown tool, invalid input, a thrown error or a timeout becomes an error result that the model can correct. Use `"fail"` to fail the turn on a thrown error instead.

While a tool runs, the dispatch idle watchdog is suspended and the tool deadline applies. Cancelling the dispatch cancels running tools. Tool code runs in the Outpost process: JavaScript that ignores `signal` keeps running detached after its deadline, although its later sandbox calls are rejected.

## Control the loop with hooks and permissions

Hooks are control code that runs at a precise point of the loop. Unlike dispatch observers, they can change what happens, and an exception thrown by a hook fails the turn.

| Phase           | Receives                        | Can return                                                  |
| --------------- | ------------------------------- | ----------------------------------------------------------- |
| `session-start` | the rendered `prompt`           | `{ instructions }` appended to the system instructions      |
| `before-model`  | the `messages` about to be sent | nothing; throw to stop the turn                             |
| `after-model`   | the model `result`              | nothing; throw to stop the turn                             |
| `before-tool`   | the validated `call`            | `{ deny: reason }`, or `{ input }` to rewrite the arguments |
| `after-tool`    | the `call` and its `result`     | `{ result }` to replace what the model receives             |
| `stop`          | the final answer `text`         | `{ continue: message }` to refuse stopping                  |

Every hook also receives the borrowed `sandbox`, the turn `signal`, the agent `model` and the current `step`. Hooks of the same phase run in declaration order. `before-tool` hooks run one call at a time in call order, before any tool of that step executes. A rewritten input is validated and checked against permissions again. A `stop` hook that keeps refusing is still bounded by `maxSteps`.

```ts
import {
  defineHarnessHook,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

export const permissions = defineHarnessPermissions({
  default: "deny",
  rules: [
    { effect: "deny", commands: ["git push*"], reason: "Do not publish." },
    { effect: "allow", tools: ["read_*", "list_*"] },
    { effect: "allow", tools: ["write_file"], paths: ["src/**", "test/**"] },
    { effect: "allow", tools: ["shell"], commands: ["npm test", "npm run *"] },
  ],
});

let tested = false;
export const requireTests = [
  defineHarnessHook({
    on: "after-tool",
    run({ call, result }) {
      if (call.name === "shell" && !result.isError) tested = true;
    },
  }),
  defineHarnessHook({
    on: "stop",
    run: () =>
      tested ? undefined : { continue: "Run npm test before you finish." },
  }),
];
```

Pass them with `harness({ permissions, hooks: requireTests, ... })`. Permission rules are evaluated first; the first rule that applies decides, and `default` applies otherwise. Rules match tool names, and the paths and command that a tool declares through its `resources(input)` function. An `allow` rule with `paths` requires every declared path to match; a `deny` rule needs one. Paths outside the repository never match. A tool without `resources` is matched by name only.

Instructions tell the model what to do; hooks and permissions enforce it. Permissions are not a security boundary: shell metacharacters can bypass command patterns, and symbolic links can bypass path rules. Run untrusted work in an isolated sandbox provider.

## Skills

A skill packages instructions, and optionally tools, that the model loads only when a task needs them. This keeps the system instructions short.

```ts
import { defineHarnessSkill, defineHarnessTool } from "@elie-laloum/outpost";

const applyMigration = defineHarnessTool({
  name: "apply_migration",
  description: "Apply the pending database migration.",
  input: { type: "object", additionalProperties: false },
  execute: async (_input, { sandbox, signal }) =>
    (
      await sandbox.invoke({
        executable: "npm",
        arguments: ["run", "migrate"],
        signal,
      })
    ).stdout,
});

export const migrations = defineHarnessSkill({
  name: "migrations",
  description: "Plan and apply database migrations.",
  instructions:
    "Back up the database, write a reversible migration, then apply it.",
  tools: [applyMigration],
});
```

Pass skills with `harness({ skills: [migrations], ... })`. The system instructions then list each skill's name and description, and the engine adds a `load_skill` tool. Loading a skill returns its instructions, resolved at that moment like `defineHarnessInstructions()`, and enables its tools from the next step.

Skill tools are declared to the model from the start so that the tool list, and therefore the provider cache, stays stable; calling one before its skill is loaded is refused with an explanation. Loaded skills are read from the conversation, so they stay loaded after a continuation. Names of skill tools share the harness namespace, and `load_skill` is reserved when skills are present.

## Conversations, repairs and context

Each turn of a custom harness is recorded as an append-only JSONL transcript in `.outpost/conversations/harness/<id>.jsonl` of the target repository, with private file permissions. Outpost adds this directory to the repository's Git exclusions. The dispatch result returns the `conversation` id and the `transcript` path, so custom harnesses support the same continuation features as Claude Code and Codex:

- `continuation: { id }` resumes the conversation: the next prompt is appended after the full history, including tool calls and results.
- `continuation: { id, fork: true }` starts a new conversation from a copy of the history; the original is unchanged.
- `response` repairs reuse the conversation. During a repair turn only `readOnly` tools are offered.

Only one turn can write a conversation at a time; a concurrent resume fails with code `conflict`. If a turn stopped after the model requested tools, resuming adds an error result for each unanswered call. Set `conversations: false` to disable recording, and therefore continuation and repairs. To keep transcripts outside the host, pass `conversations: transportConversations("harness", { transporter, namespace })`; see [storage transports](../../operations/storage-transports/).

Long turns can outgrow the model context. Set `context` to a strategy that rewrites the history before a request:

```ts
import { summarizeHistory, truncateToolResults } from "@elie-laloum/outpost";

export const shorten = truncateToolResults({
  keepRecent: 4,
  maxCharacters: 2_000,
});
export const summarize = summarizeHistory({
  triggerCharacters: 400_000,
  keepRecentMessages: 6,
});
```

`truncateToolResults()` shortens the results of older tool calls and keeps the most recent ones intact. `summarizeHistory()` asks the model to summarize the older part once the history exceeds a size, keeps the first prompt and the recent messages, and costs one extra request. `defineHarnessContextStrategy({ name, compact })` lets you write your own; `compact` receives the messages and a `summarize()` helper and returns a new list, or nothing to keep the history.

The engine validates the new history, removes reasoning blocks from it, since they are only valid in the original conversation, records it as a `compaction` entry in the transcript and emits a `compaction` event. Rewriting the history changes the conversation prefix, so the provider cache restarts from that point.

## Observe the loop

Dispatch observers receive `step` before each model request, `text-delta` fragments while a streaming provider answers, `tool` with a `callId` before each call, `tool-result` with a preview after it, `tool-denied` when permissions or a hook refuse a call, `stop-prevented` when a `stop` hook refuses the answer, `compaction` when a context strategy rewrites the history, `conversation` with the conversation id, `text` for model text, and `usage` for each request. See [Observability](../observability/) for the other events.

## Not available yet

Interactive attachment is unsupported. See the [roadmap](../../../project/roadmap/#direct-model-harness) for the validation that remains.

[Harness reference](../../../reference/overview/harness/) · [Model providers](../../advanced/model-providers/)
