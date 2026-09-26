---
title: "Task input"
description: "Supply text, files and prompt variables."
---

A brief is either `{ text }` or `{ file, values }`. Use text for application-generated requests and a file for a reusable task template.

```ts
import { fileURLToPath } from "node:url";
import type { Brief } from "@elie-laloum/outpost";

const brief: Brief = {
  file: fileURLToPath(new URL("task.md", import.meta.url)),
  values: { FEATURE: "email validation" },
};
```

## File templates

Use `{{FEATURE}}` in the file to insert the value above. `WORK_BRANCH` and `BASE_BRANCH` are built-in variables describing the selected Git workspace. Keep instructions concrete: name the files, required checks and whether the agent should commit.

Prompt files can expand original shell command fragments. Expansion executes commands, so treat the template and values inserted into those commands as trusted input. Substituted text cannot introduce new expansion fragments. `expansionMs` bounds each expansion.

## Separate instructions from enforcement

A brief can ask the agent to run tests or avoid a file. Enforce important conditions in your application: run a command, inspect its status, validate a response or wait at a review gate. An instruction alone is not an enforced workflow dependency.

Use [Output validation](../output-validation/) when another task consumes the agent’s answer.

API: [Brief](../../reference/brief/) · [DispatchOptions](../../reference/dispatchoptions/).
