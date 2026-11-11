---
title: "Compose loop steps"
description: "Chain agents and commands in a loop attempt and check, and decide from a typed answer."
---

A declarative `loop` repeats its attempt until its check accepts the work, for at most `maxRounds` rounds. Each phase is an ordered list of agent and command steps that run in the configured workspace. Start from the [single-step loop](../recipe-workflows/#repeat-until-a-check-passes) and the configuration of the [local tutorial](../yaml-recipes/).

## Chain attempt and check steps

This recipe lets a coder and a documenter work in the same workspace, then runs the tests and a reviewer. The `reviewer` role and the `review` response are declared in the configuration below.

```yaml title="recipe.yaml — loop steps"
version: 3
name: reviewed-change
inputs:
  goal: { type: string, description: The change to implement. }
  threshold: { type: number, description: Minimum review score., default: 8 }
tasks:
  - key: change
    loop:
      maxRounds: 4
      attempt:
        - agent: coder
          conversation: continue
          brief: "Implement {{ inputs.goal }} and commit it."
        - agent: documenter
          brief: "Document the changes and commit them."
          followUp: "Document the changes and commit them. Previous check: {{ loop.feedback }}"
      check:
        - command: { executable: npm, arguments: [test] }
        - agent: reviewer
          brief: "Review the changes (git log -p) and score them."
          dispatch:
            deadlineMs: 600000
            response: { $ref: responses.review }
          done:
            all:
              - { gte: [{ $response: [score] }, { $input: threshold }] }
              - { eq: [{ $response: [issues] }, []] }
```

Attempt steps run in order and must include at least one agent. Check steps also run in order: the first step that refuses ends the round, and its feedback goes to the next round without running the later steps. When every check step accepts, the loop is done.

A command in the attempt that exits with a nonzero status fails the task without another round, like a `command` task. A command in the check accepts on status 0; otherwise its status and the last 4,000 characters of stdout and stderr become the feedback.

```yaml title="outpost.yaml — loop agents"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: reviewed-change, from: main }
sandbox: { provider: local }
agents:
  coder: { harness: codex, authentication: account }
  documenter: { harness: codex, authentication: account }
  reviewer: { harness: claude, authentication: account }
responses:
  review:
    type: json
    tag: review
    jsonSchema:
      type: object
      properties:
        score: { type: number }
        issues: { type: array, items: { type: string } }
        feedback: { type: string }
      required: [score, issues, feedback]
```

A mapping is the shorthand for a one-step list: `attempt: { agent: coder, brief: ... }` and `check: { command: ... }` keep working unchanged.

## Send briefs across rounds

Round 1 sends each agent its `brief`. Later rounds depend on its conversation:

| `conversation`  | Rounds 2 and later                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `new` (default) | A new conversation receives `followUp`, which must restate the whole task, or else `brief` again.    |
| `continue`      | The agent's previous conversation receives `followUp`, or else a built-in message with the feedback. |

Each attempt agent keeps its own conversation. Every attempt agent receives the same feedback. When several agents continue their conversations, give a `followUp` to those that should not fix the work: the built-in message asks them to address the feedback.

| Value                 | Available in                             | Contents                                         |
| --------------------- | ---------------------------------------- | ------------------------------------------------ |
| `{{ loop.round }}`    | Every step                               | Round number, starting at 1                      |
| `{{ loop.feedback }}` | `brief` and `followUp` of attempt agents | Feedback of the rejected round; empty in round 1 |
| `{{ loop.text }}`     | `brief` of check agents                  | Final answer of the last attempt agent           |

`{{ loop.text }}` comes from the last agent of the attempt. Place last the agent whose answer the reviewer needs, or ask the reviewer to read the commits, as `git log -p` does above. Loop values are inserted once and are never interpreted again: an agent answer containing `{{ inputs.x }}` stays literal.

## Decide with a typed answer

A check agent starts a new conversation each round and never remembers its earlier reviews. Its verdict depends on its `response`:

| Declaration                    | Verdict                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| No `response`                  | The agent answers the built-in `{ done, feedback }` contract.         |
| JSON `response` without `done` | The response must require `done` (boolean) and `feedback` (string).   |
| JSON `response` with `done`    | The condition decides; the response must require `feedback` (string). |

`done` uses the language of [`when` conditions](../recipe-workflows/#pass-inputs-and-results): `all`, `any`, `not`, `exists` and comparisons. `{ $response: [score] }` reads a field of the agent's typed answer and `[]` reads the whole answer; it is accepted only inside `done`. A condition may also read inputs and tasks listed in `after`, but not `{{ loop.* }}` values.

When the condition is false, the response's `feedback` field becomes the feedback; a `done` field in the answer is ignored. A missing field, incomparable values or a missing `feedback` on refusal fail the task, like an exception in a TypeScript `check`. Require the fields the condition reads in the response schema. Validation checks the top-level `properties` and `required` of a declared schema; a more complex schema is checked when the agent answers. A text response is refused.

`$response` is a reserved key in format 3 expressions: to write a literal object with this key, wrap it in `{ $literal: ... }`.

## Configure each agent's dispatch

An agent step's `dispatch` accepts the [agent task dispatch options](../../reference/dispatchoptions/), inline or with `$ref`, except `continuation`: the loop manages conversations. A continued conversation or a typed response requires a single pass, so a check agent always uses one. The `repairs` of a custom response apply. `quotaResume` stays on the loop task and applies to all its agents. The loop task keeps `after`, `when`, `timeoutMs`, `options` and `quotaResume`, and refuses `retry`, `gate` and `interaction`.

These cases are refused before the first round, for each agent concerned: `conversation: continue` on a fallback agent or an agent that cannot resume conversations, and a custom response with `repairs` above 0 on an agent, or a fallback candidate, that cannot resume its conversation.

## Read the result

`outputs.change` holds the projection of the last attempt agent (`text`, `conversation`, `value` and the other dispatch fields, without `usage` and `turns`), the `commits` of every agent in every round and `rounds`. With several attempt agents, `conversations` lists each agent's conversation in order, or `null` when it reported none. Commits made by a command step are not listed in `commits`.

When the last round is rejected, the task fails with a message ending with its feedback. A step failure names the task, the round, the phase, the step's rank and its agent or command.

## Deadlines, budgets and masking

A check command that exceeds its `deadlineMs` refuses the round with the output seen so far. A check agent whose dispatch exceeds its `deadlineMs` fails the task, like any dispatch. `timeoutMs` bounds a whole round and `budget.attempts` counts rounds, so one round may contain several dispatches; see [budgets](../budgets/).

The output of a check command enters the next brief and the checkpoint unmasked. The failure message and the `loop` event of each rejected round mask the feedback with `workflow.redact`, then keep its first and last 1,000 characters.

## Resume and quota pauses

With a [checkpoint](../recipe-durability/), a crash during the check does not repeat the attempt but runs every check step again. A crash during the attempt repeats all its steps, including completed ones, after `resume --retry-incomplete`: commands run again, and commits already made stay on the branch without appearing in `commits`. Usage of completed steps is kept and the replay's usage is added.

A [quota pause](../quota-pauses/) resumes the interrupted phase. In a phase with one agent, `quotaResume: continue` continues its conversation as before. In a phase with several agents, the pause does not say which agent stopped: the phase starts again, each agent with its brief, like `quotaResume: restart`. Files and commits already produced stay in the workspace.

## Map to TypeScript

A declarative loop compiles to [`defineLoopTask()`](../../reference/definelooptask/); see the [TypeScript loop guide](../verification-loops/).

| YAML                             | TypeScript                                                   |
| -------------------------------- | ------------------------------------------------------------ |
| `attempt` steps                  | Code in `attempt(context, feedback, previous)`               |
| `check` steps                    | Code in `check(context, result)` returning `LoopCheckResult` |
| `followUp` on a new conversation | `feedback === undefined ? firstBrief : followUpBrief`        |
| `done` condition                 | Code turning a typed response into `{ done, feedback }`      |
| A failing attempt command        | An exception thrown by `attempt`                             |

## Limits

- Live runs with Claude Code or Codex are not validated: these loops are tested with scripted agents. Continuing a conversation in a new sandbox after a resume is validated offline only.
- After a crash, a phase replays in full. After a quota pause, a phase with several agents starts again.
- `done` reads only its own agent's answer, inputs and upstream tasks, not the attempt result or other steps.
- A round may exceed a token budget by the usage of several agents.
- Events do not distinguish the steps of one round, except by agent name.
- A fallback agent or an agent that cannot resume conversations is refused at compilation, before allocation; in a Git workspace, `recipe validate` does not detect it.
