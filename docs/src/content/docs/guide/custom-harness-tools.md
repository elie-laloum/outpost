---
title: "Create a tool for your agent"
description: "Expose one sandbox operation to the model, then connect it to a harness."
---

Start from [Give the model tools](../harness-tools/) and its configuration. Expose one sandbox operation to the model, then connect it to a harness.

<!-- example:include harness-tools read-model.ts -->

## Define a tool

This tool lets the model run tests inside the sandbox. The model can request the whole suite or select tests by name.

<!-- tabs -->

```ts title="test-input.ts"
import { z } from "zod";

export const testInput = z.object({ match: z.string().optional() });
export type TestInput = z.infer<typeof testInput>;
```

```ts title="execute-tests.ts"
import type { TestInput } from "./test-input.ts";
import type { HarnessToolContext } from "@elie-laloum/outpost";

export async function executeTests(
  { match }: TestInput,
  { sandbox, signal }: HarnessToolContext,
) {
  const result = await sandbox.invoke({
    executable: "npm",
    arguments: [
      "test",
      ...(match ? ["--", `--test-name-pattern=${match}`] : []),
    ],
    signal,
  });
  return {
    content: result.stdout + result.stderr,
    isError: result.status !== 0,
  };
}
```

```ts title="run-tests.ts"
import { defineHarnessTool } from "@elie-laloum/outpost";
import { testInput } from "./test-input.ts";
import { executeTests } from "./execute-tests.ts";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: testInput,
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  execute: executeTests,
});
```

API reference: [HarnessToolOptions](../../reference/harnesstooloptions/), [HarnessToolContext](../../reference/harnesstoolcontext/) and [ToolOutput](../../reference/tooloutput/).

A tool name must contain 1 to 64 letters, digits, `_` or `-`. By default, an execution error is sent back to the model as a failed tool result. Set `toolExecution.onError: "fail"` to stop the turn instead; see [Built-in harness](../harness/).

## Group tools into a toolset

`defineHarnessToolset()` bundles tools and other toolsets under one name, so you can share them between harnesses.

<!-- tabs -->

```ts title="inspect-tools.ts"
import {
  defineHarnessToolset,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});
```

```ts title="coding-tools.ts"
import {
  defineHarnessToolset,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { inspect } from "./inspect-tools.ts";

export const coding = defineHarnessToolset({
  name: "coding",
  tools: [inspect, createHarnessEditTools(), createHarnessShellTools()],
});
```

Each tool name must be unique across the harness: its tools, nested toolsets and [skill](../harness-context/) tools. A duplicate fails when you create the harness.

## Try the tool

Reuse `read-model.ts` from [built-in tools](../harness-tools/) and the [setup configuration](../setup/). Install `zod`. The repository needs a working `npm test`; configure the model and its key as on the harness page. Save this file and run `node test-agent.ts`.

```ts title="test-agent.ts"
import { createAgent, createHarness, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { modelProvider } from "./read-model.ts";
import { runTests } from "./run-tests.ts";

const agent = createAgent({
  model: "claude-sonnet-5-5",
  harness: createHarness({ modelProvider, tools: [runTests] }),
});
const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  brief: { text: "Call run_tests and report its result." },
});
console.log(result.text);
```

The agent can call `run_tests` and receives stdout, stderr and the command verdict. Its final text is not an enforced check: use a [command task](../verification-loops/) when passing tests must gate the next step. `execute` runs on the host; only `context.sandbox` runs the command inside the sandbox.
