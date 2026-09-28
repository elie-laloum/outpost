---
title: "TaskInteractionContext"
description: "TaskInteractionContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteractionContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                              | Presence | Meaning                                                                                                                                                                          |
| --------- | ----------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`   | `WorkflowJson \| undefined`                                       | Required | Latest immutable task continuation state restored from the checkpoint, or undefined before the first save.                                                                       |
| `answer`  | `WorkflowAnswerRecord \| undefined`                               | Required | Accepted human reply available to the resumed task attempt.                                                                                                                      |
| `save`    | `(state: WorkflowJson) => Promise<void>`                          | Required | Validate, copy and persist JSON state during the current active attempt. Does not suspend execution.                                                                             |
| `suspend` | `(question: WorkflowInputQuestion, state: WorkflowJson) => never` | Required | Store a new question and continuation state, then end this attempt through a suspension signal. Do not catch that signal; the scheduler persists waiting-input before returning. |

## Signature

```ts
export interface TaskInteractionContext {
  readonly state: WorkflowJson | undefined;
  readonly answer: WorkflowAnswerRecord | undefined;
  save(state: WorkflowJson): Promise<void>;
  suspend(question: WorkflowInputQuestion, state: WorkflowJson): never;
}
```

## Related contracts

- [WorkflowAnswerRecord](../workflowanswerrecord/)
- [WorkflowInputQuestion](../workflowinputquestion/)
- [WorkflowJson](../workflowjson/)
