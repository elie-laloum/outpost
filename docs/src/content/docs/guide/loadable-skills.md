---
title: "Loadable skills"
description: "Load focused instructions and tools only when needed."
---

The built-in harness lists skill descriptions in its system instructions. The model calls `load_skill` to obtain the instructions and enable the skill’s tools.

```ts
import {
  defineHarnessSkill,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

const reviewSkill = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
```

Pass the result in `createHarness({ skills: [reviewSkill] })`. Names must be unique, and tool names must not collide with other harness or skill tools.

## Dynamic instructions

`instructions` can be text or a resolver receiving the sandbox, signal and model. Read repository material through the borrowed sandbox. Use `defineHarnessInstructions()` to compose reusable system instructions resolved for each turn.

A skill makes guidance available; it does not enforce a review gate. Use workflow [review gates](../review-gates/) when continuation depends on an authorized decision.

API: [defineHarnessSkill](../../reference/defineharnessskill/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/).
