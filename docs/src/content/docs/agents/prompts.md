---
title: "File briefs and expansion"
description: "File briefs and expansion — Outpost"
sidebar:
  order: 6
---

A brief is either `{ text }` or `{ file, values? }`. Supply exactly one form. Inline text is literal: it is never expanded.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

await dispatch({
  agent: codex(),
  brief: { file: ".outpost/brief.md", values: { OBJECTIVE: "Fix validation" } },
  diagnostic: console.log,
  warn: console.warn,
});
```

Example `.outpost/brief.md`:

```md
Objective: {{OBJECTIVE}}
Work branch: {{WORK_BRANCH}}
Base branch: {{BASE_BRANCH}}

Current changes:
!`git status --short`

Implement, test and commit. Print <outpost>done</outpost> when finished.
```

## Resolution rules

Relative file paths resolve from the caller’s working directory. The file is reread each pass. `values` accepts primitive prompt variables; the reserved branch values come from the workspace. A missing value fails noninteractive execution. Unused values are reported through `warn`. Interactive attachment can resolve missing names through `ask(name)`.

Original embedded commands run concurrently inside the sandbox after setup hooks. `expansionMs` limits each command (30 seconds by default). Nonzero commands fail expansion. `diagnostic` receives expansion-size estimates to help identify unexpectedly large prompts.

Only command fragments present in the original file are executed. Text introduced by substitution cannot create additional expansion commands. However, values inserted into an existing shell fragment are still shell input: interpolate only trusted, correctly quoted values there.

Use file briefs when the prompt should change between passes or needs live repository context. Use literal text for user-supplied content that must not be interpreted as a template.
