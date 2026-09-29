---
title: "CI automation"
description: "Run unattended work with explicit access and delivery checks."
---

Use API credentials or a dedicated supported account token for unattended jobs. Configure the harness explicitly and declare only the required secret variables.

## Prepare the runner

```sh
npm ci
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev --json
node review.mts
```

This assumes a committed workflow project, its lockfile, a built `outpost:dev` image and the `review.mts` request from [First request](../first-request/). The runner needs Node.js 24+, Git history sufficient for the task, Docker and the target checkout. For cloud execution, install its optional SDK and supply allocation credentials instead of a local engine.

## Fail the job correctly

Throw on failed validation commands and call `result.unwrap()` for workflows. Console output alone does not set a failing job status. Set operation deadlines, pass cancellation signals and close owned resources in `finally`.

## Deliver changes

Use a named branch for review. Integrate only after required checks and approvals, then let your existing CI delivery process push or publish. Outpost does not automatically push all repositories in a workflow.

To start runs from a schedule or a repository event without a CI job, use [triggers](../triggers/).

Preserve recovery paths, checkpoints and artifact references when a job fails. Do not upload raw credential files or private transcripts as public CI artifacts.
