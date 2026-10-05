---
title: "Add a CLI agent"
description: "Build an adapter that starts your agent CLI and reads its output as Outpost events."
---

## Write a minimal adapter

Implement an `AgentAdapter` to describe how your CLI starts and how its output becomes events: `request()` builds the command and `events()` reads its output lines. A `CliHarness` binds that adapter to the selected model, and `createAgent()` makes it usable in a dispatch.

<!-- tabs -->

```ts title="protocol-values.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export const parse = (line: string) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};
export function usage(input: number, output: number): AgentEvent {
  return { kind: "usage", tokens: { input, cached: 0, output } };
}
```

```ts title="events.ts"
import type { AgentEvent } from "@elie-laloum/outpost";
import { parse, usage } from "./protocol-values.ts";

export function events(line: string): AgentEvent[] {
  const event = parse(line);
  switch (event?.type) {
    case "session":
      return [{ kind: "conversation", id: event.id }];
    case "message":
      return [{ kind: "text", text: event.text }];
    case "tool":
      return [{ kind: "tool", name: event.name, input: event.input }];
    case "usage":
      return [usage(event.input, event.output)];
    case "error":
      return [{ kind: "failure", message: event.message }];
    default:
      return [];
  }
}
```

```ts title="model-request.ts"
import type { AgentModel, AgentAdapter } from "@elie-laloum/outpost";

export function requestForModel(model?: AgentModel): AgentAdapter["request"] {
  return ({ text }) => ({
    executable: "mycli",
    arguments: ["--json", ...(model ? ["--model", model.name] : [])],
    stdin: text ?? "",
  });
}
```

```ts title="mycli-agent.ts"
import type { CliHarness } from "@elie-laloum/outpost";
import { requestForModel } from "./model-request.ts";
import { events } from "./events.ts";
import { createAgent } from "@elie-laloum/outpost";

export const myCliHarness: CliHarness = {
  kind: "cli",
  bind(model) {
    if (model?.reasoning || model?.maxOutputTokens)
      throw new Error("mycli accepts only a model name");
    return {
      name: "mycli",
      request: requestForModel(model),
      events,
    };
  },
};
export const myCli = createAgent({ harness: myCliHarness, model: "mycli-pro" });
```

```ts title="mycli.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { myCli } from "./mycli-agent.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: myCli,
  branch: { mode: "named", name: "outpost/mycli-review" },
  brief: { text: "Review the README for incorrect setup instructions." },
});
reportValue(result.text);
// Example output: The README setup command uses an outdated flag.
```

Outpost runs `mycli --json --model mycli-pro` in the sandbox with the brief on stdin, passes each stdout line to `events()` and returns the collected text in `result.text`. Install the CLI in your [agent image](../agent-images/) first.

## Build the command

`request()` receives an `AgentInput` and returns a `Command`: `executable`, `arguments`, `stdin`, `variables`. Outpost adds the deadline and the cancellation signal.

API reference: [AgentInput](../../reference/agentinput/).

## Decode the output

`events()` receives each stdout line and returns zero, one or several events. Stderr never reaches it: Outpost reports stderr lines as `stderr` events.

API reference: [AgentEvent](../../reference/agentevent/).

Other kinds, such as `tool`, `tool-result`, `reasoning`, `file-change` and `warning`, reach only [observers](../progress/). A nonzero exit status fails the turn. Without `text` or `result` events, `result.text` holds the end of stdout.

:::caution
An exception thrown by `events()` fails the turn. Return `[]` for lines you do not recognize.
:::

## Declare optional capabilities

Each optional member enables one feature. Declare only what the CLI really does.

API reference: [AgentAdapter](../../reference/agentadapter/).

## Report token usage

`usage` tells Outpost where the counters come from. Incomplete usage is a lower bound that [budgets](../budgets/) treat separately.

API reference: [Usage](../../reference/usage/).

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";

export const sessionUsage: Pick<
  AgentAdapter,
  "usage" | "usageCommand" | "usageResult"
> = {
  usage: "session",
  usageCommand: (conversation) => ({
    executable: "mycli",
    arguments: ["usage", "--json", conversation],
  }),
  usageResult: (text) => {
    const totals = JSON.parse(text);
    return {
      input: totals.input,
      cached: totals.cached,
      output: totals.output,
    };
  },
};
```

Spread `sessionUsage` into the adapter. The command has five seconds and is skipped when a cumulative `usage` event already gave the totals. On a continued conversation, Outpost measures a baseline first and keeps the difference; a fork has no baseline, so its usage is incomplete.

With `storage`, `transcriptUsage(text)` can instead read the totals from the captured transcript.

## Steer a running turn

A [steered](../steering/) dispatch reaches your CLI in one of two ways.

| Adapter                           | Delivery   | What happens                                                                             |
| --------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| With `liveInput`                  | `injected` | Outpost writes each instruction to the running process's stdin.                          |
| `resumable: true`, no `liveInput` | `resumed`  | Outpost stops the process once its conversation is known, then resumes it with the text. |
| Neither                           | ―          | The dispatch is rejected before it starts.                                               |

```ts
import type { AgentLiveInput } from "@elie-laloum/outpost";

export const liveInput: AgentLiveInput = {
  open: () => ({
    encode: (text) => `${JSON.stringify({ type: "user", text })}\n`,
    read: (line) => ({
      consumed: line.includes('"type":"user-ack"') ? 1 : 0,
      replies: [],
    }),
  }),
};
```

`encode()` turns one instruction into stdin text. `read()` sees every stdout line and returns the number of messages the CLI confirmed, plus protocol replies to write, such as answers to permission requests.

The prompt counts as the first message to confirm. Outpost keeps stdin open and closes it after a `finished` event once every message was consumed.

Injection also needs a `SandboxLease` with `liveInput: true`, which every built-in provider returns. On a [custom provider](../custom-sandbox-providers/) without it, a resumable adapter falls back to `resumed`.

## What Outpost handles for you

<!-- features -->

- **Process**: Deadlines, idle timeouts and cancellation stop the whole process group.
- **Sandbox and workspace**: Allocation, the worktree, commits and cleanup work as for built-in agents.
- **Agent home**: The plans from `credentials()` and `configuration()` are installed in the private sandbox home.
- **Answers**: Typed responses, repairs and completion markers apply to your decoded text.
- **Usage**: Counters add up across turns, retries and workflows, and feed budgets.
- **Observation**: Decoded events, raw lines and stderr reach `observe`, reporters and journals.

## Test the adapter

Record real output lines of the CLI once, then replay them through `events()`. [`diagnoseAgentProtocol()`](../diagnostics/) checks the built-in agents the same way.

<!-- tabs -->

```ts title="protocol.types.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export interface ProtocolFixture {
  readonly name: string;
  readonly lines: readonly string[];
  readonly expected: readonly AgentEvent[];
}
```

```ts title="check-protocol.ts"
import type { CliHarness } from "@elie-laloum/outpost";
import type { ProtocolFixture } from "./protocol.types.ts";
import assert from "node:assert/strict";

export function checkProtocol(
  harness: CliHarness,
  fixtures: readonly ProtocolFixture[],
): void {
  const adapter = harness.bind();
  for (const fixture of fixtures)
    assert.deepEqual(
      fixture.lines.flatMap((line) => adapter.events(line)),
      fixture.expected,
      fixture.name,
    );
}
```

Add fixtures for failures, and check that `quota()` matches only terminal limit messages, not retry notices. Then run one real dispatch in a container: fixtures do not test installation, sign-in, exit status or capture.

## Limits

- Remote bootstrap installs only built-in CLIs. Install yours in the image of every provider you use.
- `outpost init`, `outpost doctor` and `diagnoseAgentProtocol()` know only the built-in agents.
- One stdout line holds at most 16 MiB; a longer line fails the turn.

API: [createAgent](../../reference/createagent/) · [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [AgentInput](../../reference/agentinput/) · [AgentEvent](../../reference/agentevent/) · [AgentLiveInput](../../reference/agentliveinput/) · [Usage](../../reference/usage/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/).
