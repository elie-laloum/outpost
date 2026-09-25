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

Retries can repeat filesystem or external side effects. Test commands are usually easy to retry; a committing agent needs a deliberate retry policy.

## Multiple repositories

A workflow can live in `/path2/workflow1` and orchestrate external repositories. Each isolated task selects its own `repository`; a sandbox owns one repository. Tasks can depend on each other or run concurrently when independent.

In the generated `run.ts`, keep the `.env` loading and `runtime` configuration. Replace the `dispatch` import with `isolatedTask, workflow`, then replace the final dispatch with:

```js
const backend = isolatedTask({
  key: "backend",
  request: () => ({
    ...runtime,
    repository: "/path1/repository",
    branch: { mode: "named", name: "outpost/backend" },
    brief: { text: "Implement the API change, test and commit." },
  }),
});
const frontend = isolatedTask({
  key: "frontend",
  after: [backend],
  request: () => ({
    ...runtime,
    repository: "/path3/another-repository",
    branch: { mode: "named", name: "outpost/frontend" },
    brief: { text: "Adapt the frontend, test and commit." },
  }),
});
(await workflow("workflow1", [backend, frontend]).start()).unwrap();
```

Commits remain on the named branches in each repository. Managed worktrees and logs are stored in each target repository’s `.outpost`; clean worktrees are removed after successful disposal. There is no shared Git transaction across repositories: a successful task is not rolled back if a later task fails.

`after: [backend]` orders execution; it does not copy files or commits into the frontend repository. Use `request(context)` and `context.value(backend)` to pass the backend result explicitly into the next brief. Independent tasks can run concurrently; tasks sharing a sandbox must be serialized. See [choose a repository](../../../environment/repositories/) for paths and file locations.
