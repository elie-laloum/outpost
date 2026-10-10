---
title: "Resume a candidate race"
description: "Add durability to competing candidates before the run starts."
---

Add durability to [competing candidates](../speculation/) before the run starts. This experimental feature preserves progress; replay after a crash still needs explicit authorization.

## Resume after a crash

Pass `durability` to `speculate()`. Attempts, usage, outputs and allocated resources are saved through a [transport](../storage/), and a finished race is returned without running again.

```ts title="durability.ts"
import { join } from "node:path";
import {
  createLocalTransport,
  type SpeculationDurability,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export const durability: SpeculationDurability = {
  transporter: createLocalTransport({
    directory: join(repository, ".outpost", "storage"),
  }),
  runId: "parser-race",
  version: "1",
};
```

Reuse `candidates.ts` and `validate.ts` from [the first race](../speculation/). This entry point uses the same budget on every call.

<!-- example:include speculation candidates.ts validate.ts -->

```ts title="durable-race.ts"
import { speculate } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { candidates } from "./candidates.ts";
import { validate } from "./validate.ts";
import { durability } from "./durability.ts";

const result = await speculate({
  repository,
  sandboxProvider,
  candidates,
  validate,
  budget: { attempts: 2, usage: { output: 20_000 } },
  durability: {
    ...durability,
    ...(process.argv.includes("--retry-incomplete")
      ? { resume: "retry-incomplete" as const }
      : {}),
  },
});
console.log(result.status, result.winner?.branch);
```

`node durable-race.ts` starts the race or reads its completed result. After the inspection and ownership recovery below, `node durable-race.ts --retry-incomplete` authorizes interrupted candidates to run again.

Change `version` when you change the agents, `validate` or `score`. A saved race whose briefs, budget, provider, selection mode or `version` differ is rejected: start it under a new `runId`.

Durable races need a provider that can find and stop its sandboxes after a crash. Docker and Podman in their default mounted mode can; other providers are rejected unless you [implement recovery](../custom-sandbox-providers/).

### Recover after a crash

A crashed race stays owned by its coordinator, the process that ran `speculate()`. Release it before replaying.

1. Stop the old coordinator and confirm it has exited; a timeout or missing PID is insufficient.
2. Read the saved race through the transport. Inspect candidate resource IDs and keep the current revision.
3. Call `recoverSpeculation()` with that revision to release ownership. A changed revision is refused; this call deletes nothing.
4. Run the same race with `durability.resume: "retry-incomplete"`. Outpost reconciles registered sandboxes, then restarts interrupted candidates on new branches.

```ts
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createLocalTransport, recoverSpeculation } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
const transporter = createLocalTransport({
  directory: join(repository, ".outpost", "storage"),
});
const key = `speculations/${createHash("sha256").update("parser-race").digest("hex")}.json`;
const saved = await transporter.read(key);
if (saved) {
  console.log(new TextDecoder().decode(saved.bytes));
  // Example output: {"runId":"parser-race",…}
  await recoverSpeculation({
    transporter,
    runId: "parser-race",
    revision: saved.revision,
    coordinatorStopped: true,
  });
}
```

An interrupted candidate runs again as a new attempt, on `…/<key>/2`, from the original commit. Its earlier branch and worktree are listed in `result.previousAttempts`. Candidates validated and scored before the crash keep their saved scores; best selection still waits for the remaining admitted candidates. A crash during scoring requires an explicitly authorized new attempt.

## Resume after a quota

A durable race that ends with status `quota` is not final. Calling `speculate()` again with the same `durability` reruns only the candidates a usage or rate limit stopped, as new attempts. `result.quota.resetAt` gives the reset time when the agent reports it; [Quota pauses](../quota-pauses/) covers waiting for it.
