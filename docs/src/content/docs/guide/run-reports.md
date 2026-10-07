---
title: "Share a run report"
description: "Export a dispatch summary with committed files, failed tools, duration and usage."
---

## Save a summary for review

After [your first task](../first-request/), use `result.report()` to turn the returned dispatch result into a review document. Save this as `report.ts`, alongside the configuration from [setup](../setup/), and run `node report.ts`. The agent must commit its changes for them to appear in the diff.

```ts title="report.ts"
import { writeFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  agent: coder,
  sandboxProvider,
  brief: { text: "Improve the README and commit the change." },
});
await writeFile("run-report.md", result.report({ format: "markdown" }));
await writeFile("run-report.json", result.report({ format: "json" }));
```

The Markdown contains the agent’s answer, branch, commit count, elapsed time, changed-file table, observed failed commands and tools, and reported tokens. Copy it into a PR description. JSON contains the same snapshot for your own Slack message formatting or automation; neither format publishes anything.

## Read what the report proves

The diff compares the exact commit before execution with the commit after synchronization. It excludes uncommitted and untracked files. Renames show both paths but count as one file; binary changes are counted separately from text lines. Across cold passes the report shows the net diff, so a line added and later removed contributes nothing to the final change.

A satisfied completion condition means the dispatch matched its marker or validated its typed response. It does not certify passing tests. Failed shell commands appear when the adapter emits failed tool results; other failed tools also appear. Absence of observed failures is not proof that every command succeeded. Entries carry their pass and subagent identity where available.

Duration covers the dispatch lifecycle, including allocation and cleanup for a cold dispatch. A warm `sandbox.dispatch()` measures its own operation and keeps the borrowed sandbox open. Usage includes repairs, steering and fallback attempts. With [prices](../budgets/), the report includes an estimate and marks partial pricing; without prices it states that cost is unavailable.

## Keep the snapshot after cleanup

Git statistics are collected before workspace disposal. Calling `report()` is synchronous, performs no disk access and returns the same snapshot even after the worktree or journal has disappeared. Later repository edits do not alter it. The collector consumes the same normalized observation events as the [journal](../journals/), so it also works with `logging: false` and with transported journals, without rereading them.

The failure list retains at most 100 entries and counts additional failures. Descriptions and previews are limited to 4096 characters. Collection warnings identify lost events, unavailable statistics or truncated descriptions. An unavailable diff is distinct from an empty diff, and a collection failure does not turn a successful dispatch into a failed one.

Inherited [redaction](../security/) masks all report strings, including answers, paths and commands. Markdown escapes embedded markup. Review the report before sharing: undeclared secrets can still occur in the answer, commit subjects or tool previews. If dispatch throws, there is no result to call; use [error recovery](../error-handling/) and the journal instead.

See [`DispatchResult.report`](../../reference/dispatchresult/), [`RunReport`](../../reference/runreport/) and [`RunReportOptions`](../../reference/runreportoptions/) for the exact contracts. The repository’s [offline example](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/56-run-reports) exercises a real local command failure and commit without an account or paid model call.
