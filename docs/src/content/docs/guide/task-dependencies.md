---
title: "Task dependencies"
description: "Connect typed outputs into an executable graph."
---

`task()` defines a node. `workflow()` validates the graph. Nothing runs until `start()`.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const files = task({ key: "files", perform: () => ["src/parser.ts"] });
const report = task({
  key: "report",
  after: [files],
  perform: (context) => ({ reviewed: context.value(files).length }),
});
const result = await workflow("review", [files, report]).start();
result.unwrap();
console.log(result.value(report));
```

<!-- check:run -->

## Read a dependency

Declare dependencies in `after`, then read their typed values with `context.value(task)`. Include every dependency in the workflow’s task list. Duplicate keys, missing dependencies and cycles are rejected before execution.

Independent tasks can run concurrently. Dependent tasks start after their dependencies succeed. `diagram()` returns a Mermaid representation for inspecting the graph.

## Choose a task type

| Factory        | Use                                                |
| -------------- | -------------------------------------------------- |
| `loopTask`     | Bounded attempts with feedback from verification.  |
| `task`         | Application code returning a value.                |
| `agentTask`    | An agent request on an existing sandbox.           |
| `commandTask`  | A command on an existing sandbox.                  |
| `isolatedTask` | An agent request with its own sandbox lifecycle.   |
| `queuedTask`   | Work delegated to a registered background handler. |

A workflow does not create a shared Git transaction. Each task must honor resource ownership and cancellation. Use [scheduling](../task-scheduling/) to control concurrency and retry behavior.

API: [task](../../reference/task/) · [workflow](../../reference/workflow/) · [TaskContext](../../reference/taskcontext/).

Use [verification loops](../verification-loops/) when a failed check should guide another attempt. Add a [task cache](../task-cache/) to reuse a JSON result when the task’s inputs have not changed.
