---
title: "Add a CLI agent"
description: "Run a coding-agent CLI that Outpost does not support yet: build its command, decode its output, then declare what else it can do."
---

## Write a minimal adapter

An `AgentAdapter` translates between Outpost and one CLI: `request()` builds the command, `events()` decodes each output line. A `CliHarness` creates the adapter for a model, and `createAgent()` turns it into an agent like the built-in ones.

```ts title="mycli.mts"
import {
  createAgent,
  dispatch,
  type AgentEvent,
  type CliHarness,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const parse = (line: string) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};

function events(line: string): AgentEvent[] {
  const event = parse(line);
  switch (event?.type) {
    case "session":
      return [{ kind: "conversation", id: event.id }];
    case "message":
      return [{ kind: "text", text: event.text }];
    case "tool":
      return [{ kind: "tool", name: event.name, input: event.input }];
    case "usage":
      return [
        {
          kind: "usage",
          tokens: { input: event.input, cached: 0, output: event.output },
        },
      ];
    case "error":
      return [{ kind: "failure", message: event.message }];
    default:
      return [];
  }
}

const myCliHarness: CliHarness = {
  kind: "cli",
  bind(model) {
    if (model?.reasoning || model?.maxOutputTokens)
      throw new Error("mycli accepts only a model name");
    return {
      name: "mycli",
      request: ({ text }) => ({
        executable: "mycli",
        arguments: ["--json", ...(model ? ["--model", model.name] : [])],
        stdin: text ?? "",
      }),
      events,
    };
  },
};

export const myCli = createAgent({ harness: myCliHarness, model: "mycli-pro" });

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: myCli,
  branch: { mode: "named", name: "outpost/mycli-review" },
  brief: { text: "Review the README for incorrect setup instructions." },
});
console.log(result.text);
```

Outpost runs `mycli --json --model mycli-pro` in the sandbox with the brief on stdin, passes each stdout line to `events()` and returns the collected text in `result.text`. Install the CLI in your [agent image](../agent-images/) first.

## Build the command

`request()` receives an `AgentInput` and returns a `Command`: `executable`, `arguments`, `stdin`, `variables`. Outpost adds the deadline and the cancellation signal.

| Input field         | Set when                                                   | Your command should                                     |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `text`              | Every turn                                                 | Pass the prompt, on stdin or as an argument.            |
| `continuation.id`   | The dispatch continues a conversation                      | Resume that native conversation.                        |
| `continuation.fork` | The dispatch forks a conversation and you have no `fork()` | Start a new conversation from it.                       |
| `liveInput`         | Steering uses your `liveInput` protocol                    | Put the prompt on stdin in the live protocol format.    |
| `interactive`       | [`attach()`](../sandbox-sessions/) opens a terminal        | Return `interactive: true`, pass `text` as an argument. |

## Decode the output

`events()` receives each stdout line and returns zero, one or several events. Stderr never reaches it: Outpost reports stderr lines as `stderr` events.

| Event                            | Effect on the turn                                                          |
| -------------------------------- | --------------------------------------------------------------------------- |
| `conversation` (`id`)            | Records the native conversation ID for capture, continuation and steering.  |
| `text` (`text`)                  | Appended to the answer.                                                     |
| `result` (`text`)                | The final answer; replaces the appended `text`.                             |
| `usage` (`tokens`, `cumulative`) | Adds tokens to `result.usage`. Set `cumulative: true` for running totals.   |
| `failure` (`message`)            | Fails the turn with this message.                                           |
| `quota` (`message`, `resetAt`)   | Classifies the failed turn as a [quota](../quota-pauses/) error.            |
| `finished`                       | Ends the turn. With `requiresFinishedEvent: true`, a turn without it fails. |

Other kinds, such as `tool`, `tool-result`, `reasoning`, `file-change` and `warning`, reach only [observers](../progress/). A nonzero exit status fails the turn. Without `text` or `result` events, `result.text` holds the end of stdout.

:::caution
An exception thrown by `events()` fails the turn. Return `[]` for lines you do not recognize.
:::

## Declare optional capabilities

Each optional member enables one feature. Declare only what the CLI really does.

| Member                                 | Enables                                                                                                    | Page                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Model check in `bind()`                | Throw there to reject model settings the CLI cannot apply when `createAgent()` runs, not mid-run.          | [AgentModel](../../reference/agentmodel/)                                |
| `resumable: true`                      | Continuation, typed-response repairs and resumed steering. `false` rejects continuation and forks upfront. | [Conversations](../conversations/)                                       |
| `forkable`, `fork(id, invoke)`         | Forks. `fork()` creates the child with sandbox commands and returns its ID. `false` rejects forks.         | [Conversations](../conversations/)                                       |
| `storage`, `capture`                   | Capture after each turn and resume in a new sandbox. `capture: false` turns capture off.                   | [Native conversation formats](../conversation-formats/)                  |
| `credentials(variables)`               | Variables, host files, generated files and login commands for the private agent home.                      | [Authentication](../authentication/)                                     |
| `configuration(variables)`             | CLI settings files merged into the agent home, such as MCP servers.                                        | [MCP servers](../mcp-servers/)                                           |
| `quota(text)`, `unavailable(text)`     | Classify a failed turn as a quota error or an outage from its failure or stderr text.                      | [Quota pauses](../quota-pauses/), [Fallback agents](../fallback-agents/) |
| `usage`, `usageCommand`, `usageResult` | Token accounting.                                                                                          | [Report token usage](#report-token-usage)                                |
| `liveInput`                            | Instructions injected into the running turn.                                                               | [Steer a running turn](#steer-a-running-turn)                            |
| `variables`                            | Environment variables for every command of the agent.                                                      | [Environment variables](../environment-variables/)                       |

## Report token usage

`usage` tells Outpost where the counters come from. Incomplete usage is a lower bound that [budgets](../budgets/) treat separately.

| `usage`         | What Outpost does                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `"events"`      | Adds the `usage` events. Marks usage incomplete when none arrives or the command does not complete.                       |
| `"session"`     | After the CLI exits, runs `usageCommand(conversation)` in the sandbox and parses the session totals with `usageResult()`. |
| `"unavailable"` | Marks usage incomplete before the command starts.                                                                         |
| omitted         | Adds the `usage` events without judging completeness.                                                                     |

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

```ts
import assert from "node:assert/strict";
import type { AgentEvent, CliHarness } from "@elie-laloum/outpost";

export interface ProtocolFixture {
  readonly name: string;
  readonly lines: readonly string[];
  readonly expected: readonly AgentEvent[];
}

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
