---
title: "Task dependencies"
description: "Connect typed outputs into an executable graph."
---

`defineTask()` defines a node. `defineWorkflow()` validates the graph. Nothing runs until `start()`.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const files = defineTask({ key: "files", perform: () => ["src/parser.ts"] });
const report = defineTask({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await defineWorkflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

## Read a dependency

Declare dependencies in `after`, then read their typed values with `context.value(task)`. Include every dependency in the workflow’s task list. Duplicate keys, missing dependencies and cycles are rejected before execution.

Independent tasks can run concurrently. Dependent tasks start after their dependencies succeed. `diagram()` returns a Mermaid representation for inspecting the graph.

## Choose a task type

| Declaration          | Use                                                |
| -------------------- | -------------------------------------------------- |
| `defineLoopTask`     | Bounded attempts with feedback from verification.  |
| `defineTask`         | Application code returning a value.                |
| `defineAgentTask`    | An agent request on an existing sandbox.           |
| `defineCommandTask`  | A command on an existing sandbox.                  |
| `defineIsolatedTask` | An agent request with its own sandbox lifecycle.   |
| `defineQueuedTask`   | Work delegated to a registered background handler. |

A workflow does not create a shared Git transaction. Each task must honor resource ownership and cancellation. Use [scheduling](../task-scheduling/) to control concurrency and retry behavior.

API: [defineTask](../../reference/definetask/) · [defineWorkflow](../../reference/defineworkflow/) · [TaskContext](../../reference/taskcontext/).

Use [verification loops](../verification-loops/) when a failed check should guide another attempt. Add a [task cache](../task-cache/) to reuse a JSON result when the task’s inputs have not changed.
