---
title: "Connect workflows to sandboxes"
description: "Connect workflows to sandboxes — Outpost"
sidebar:
  order: 3
---

Three task factories connect graph execution to sandbox operations. They forward the workflow signal automatically.

| Factory        | Resource ownership                        | Output                                        |
| -------------- | ----------------------------------------- | --------------------------------------------- |
| `agentTask`    | Uses a supplied warm sandbox              | Dispatch result                               |
| `commandTask`  | Uses a supplied warm sandbox              | Command result; nonzero status fails the task |
| `isolatedTask` | Creates and closes a one-shot environment | Dispatch result                               |

```ts
import {
  createSandbox,
  codex,
  agentTask,
  commandTask,
  workflow,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({ agent: codex() });
const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({ brief: { text: "Add validation and tests." } }),
});
const verify = commandTask({
  key: "verify",
  after: [implement],
  sandbox,
  command: { executable: "npm", arguments: ["test"] },
});
(await workflow("delivery", [implement, verify]).start()).unwrap();
```

`request(context)` can consume typed dependency values. `command` accepts either a `Command` or a function of context. Standard task options (`after`, `condition`, `retry`, `timeoutMs`) remain available.

Serialize tasks sharing one sandbox with `after`. For parallel agent jobs, use `isolatedTask` and distinct named branches in each request. The request must include its agent, brief and any provider/workspace settings.

Retries can repeat filesystem or external side effects. Test commands are usually easy to retry; a committing agent or tracker mutation needs a deliberate retry policy.
