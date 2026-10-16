---
title: "defineInteractiveAgentTask"
description: "defineInteractiveAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare an agent dialogue that asks humans questions between turns. Each turn runs in a new sandbox on a retained named branch and continues the captured conversation; a question leaves the task waiting-input until start() receives an answer. Requires a checkpointed run and throws with code configuration for an agent without portable capture and resume.

[Complete example and detailed rules](../../guide/interactive-tasks/).

## Parameters and properties

### Variant 1 — `InteractiveAgentTaskOptions`

| Name                       | Type                                    | Presence | Meaning                                                                                                                                                                                       |
| -------------------------- | --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `InteractiveAgentTaskOptions`           | Required | Agent, repository, authorized respondents and bounded dialogue settings.                                                                                                                      |
| `options.key`              | `string`                                | Required | Stable workflow task key; also participates in the retained branch identity.                                                                                                                  |
| `options.after`            | `readonly Task<unknown>[] \| undefined` | Optional | Dependencies that must finish successfully before the first turn.                                                                                                                             |
| `options.repository`       | `string`                                | Required | Host Git checkout containing the retained worktree and default conversation storage; must remain accessible on resume.                                                                        |
| `options.agent`            | `Agent`                                 | Required | Agent with portable conversation capture and resume; otherwise defineInteractiveAgentTask() throws with code configuration.                                                                   |
| `options.brief`            | `string`                                | Required | Literal initial instructions; human replies are supplied separately on subsequent turns. [Exact injected text and customization limits](../defineinteractiveagenttask/#outpost-instructions). |
| `options.actors`           | `readonly string[]`                     | Required | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                                                                 |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`          | Optional | Provider that allocates a new sandbox for each turn, default createDockerSandboxProvider().                                                                                                   |
| `options.bootstrap`        | `boolean \| undefined`                  | Optional | Whether each turn's sandbox may install a missing CLI agent, default true.                                                                                                                    |
| `options.conversationHome` | `string \| undefined`                   | Optional | Host home used to locate captured native conversations across turns.                                                                                                                          |
| `options.maxTurns`         | `number \| undefined`                   | Optional | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely.                                                 |
| `options.timeoutMs`        | `number \| undefined`                   | Optional | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                                                                              |

### Variant 2 — `FileInteractiveAgentTaskOptions`

| Name                      | Type                                                     | Presence | Meaning                                                                                                                                                                                       |
| ------------------------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `FileInteractiveAgentTaskOptions`                        | Required | Agent, repository, authorized respondents and bounded dialogue settings.                                                                                                                      |
| `options.workspaceSource` | `FileWorkspaceSource`                                    | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                                                                   |
| `options.sandboxProvider` | `SandboxProvider`                                        | Required | Execution provider with the required file binding capability; legacy providers remain usable for Git.                                                                                         |
| `options.agent`           | `Agent`                                                  | Required | Agent with portable conversation capture and resume; otherwise defineInteractiveAgentTask() throws with code configuration.                                                                   |
| `options.key`             | `string`                                                 | Required | Stable workflow task key; also participates in the retained branch identity.                                                                                                                  |
| `options.after`           | `readonly Task<unknown>[] \| undefined`                  | Optional | Dependencies that must finish successfully before the first turn.                                                                                                                             |
| `options.timeoutMs`       | `number \| undefined`                                    | Optional | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                                                                              |
| `options.brief`           | `string`                                                 | Required | Literal initial instructions; human replies are supplied separately on subsequent turns. [Exact injected text and customization limits](../defineinteractiveagenttask/#outpost-instructions). |
| `options.actors`          | `readonly string[]`                                      | Required | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                                                                 |
| `options.maxTurns`        | `number \| undefined`                                    | Optional | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely.                                                 |
| `options.signal`          | `AbortSignal \| undefined`                               | Optional | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.                                                                                      |
| `options.hooks`           | `LifecycleHooks \| undefined`                            | Optional | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                                                                                                     |
| `options.recovery`        | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.                                                                                     |
| `options.storageQuota`    | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission reservation through Transport; coordinates cooperating writers without enforcing a physical disk quota.                                                                             |
| `options.inputs`          | `readonly WorkspaceInput[] \| undefined`                 | Optional | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                                                                                          |
| `options.runtime`         | `WorkspaceRuntimeOptions \| undefined`                   | Optional | Control directory and logical namespace, separate from the workspace files.                                                                                                                   |
| `options.paths`           | `readonly string[] \| undefined`                         | Optional | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                                                                                        |
| `options.retention`       | `WorkspaceRetention \| undefined`                        | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace.                                                                       |

## Returns

`Task<InteractiveAgentResult>` · `Task<FileInteractiveAgentResult>`

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

Every Git or file workspace dialogue turn appends this protocol after the initial `brief`, the latest human answer or the quota-resume instruction:

```text
This is a durable interactive task. End each turn with exactly one JSON response inside <interaction> and </interaction>.
When human input is needed, return {"kind":"question","question":"Your question","choices":["Optional choice"],"allowFreeText":true}. Omit choices for free text. Set allowFreeText to false only when choices are supplied and the user must choose one.
When the entire task is complete, return {"kind":"completed","output":<your JSON result>}.
Ask one focused question at a time and adapt subsequent questions to the answers in this conversation. Do not invent a human answer. Do not wait for terminal input.
The sandbox is recreated between turns. Keep required project files in the repository. Do not switch branches, integrate or push changes. The workflow will retain the workspace.
```

After a human answer, the input preceding the protocol is:

```text
Human answer (JSON): ${answerJSON}
```

`answerJSON` is `JSON.stringify(interaction.answer.value)`. After a quota interruption, the fixed [quota-resume instruction](../quotaresumepolicy/#outpost-instructions) replaces this input.

Dispatch also appends the [final-answer format instructions](../responsespec/#outpost-instructions), using `tag: "interaction"`, `format: "json"` and the following input schema. The internal response contract allows one repair attempt.

```json
{
  "anyOf": [
    {
      "type": "object",
      "properties": {
        "kind": {
          "const": "question"
        },
        "question": {
          "type": "string",
          "pattern": "\\S"
        },
        "choices": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "\\S"
          },
          "minItems": 1,
          "uniqueItems": true
        },
        "allowFreeText": {
          "type": "boolean"
        }
      },
      "required": ["kind", "question"],
      "if": {
        "properties": {
          "allowFreeText": {
            "const": false
          }
        },
        "required": ["allowFreeText"]
      },
      "then": {
        "required": ["choices"]
      }
    },
    {
      "type": "object",
      "properties": {
        "kind": {
          "const": "completed"
        },
        "output": {}
      },
      "required": ["kind", "output"]
    }
  ]
}
```

The protocol, answer prefix, schema and repair count are fixed. `brief` supplies the task goal; it does not replace the protocol. There is no dedicated override for these instructions.

Implementation: [interactive-task.constants.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/interactive-task.constants.ts) · [interactive-task-execution.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/interactive-task-execution.ts) · [file-interactive-task.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/file-interactive-task.ts).

## Signature

```ts
export declare function defineInteractiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;

export declare function defineInteractiveAgentTask(
  options: FileInteractiveAgentTaskOptions,
): Task<FileInteractiveAgentResult>;
```

## Related contracts

- [FileInteractiveAgentResult](../fileinteractiveagentresult/)
- [FileInteractiveAgentTaskOptions](../fileinteractiveagenttaskoptions/)
- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
