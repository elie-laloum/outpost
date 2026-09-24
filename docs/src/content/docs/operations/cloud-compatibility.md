---
title: Hosted compatibility checks
description: Run opt-in Vercel and Daytona contract checks without model calls.
sidebar:
  order: 8
---

The contributor fixture `test/cloud-live.ts` provisions disposable Vercel or Daytona sandboxes. It verifies process completion after output closes, nonzero exit status, deadlines, cancellation, warm reuse, binary transfers, executable permissions, symlinks, quoted paths and incremental batch downloads. It never uploads your repository or model credentials. Cloud allocation and runtime can incur charges.

## Run manually

From a checkout of Outpost, install the locked dependencies with `npm ci` and use Node.js 24+. Export credentials through your secret manager or shell environment; do not put their values in tracked files.

| Provider | Required environment variables                        |
| -------- | ----------------------------------------------------- |
| Vercel   | `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID` |
| Daytona  | `DAYTONA_API_KEY`                                     |

This fixture deliberately uses explicit Vercel access-token authentication, including team and project identifiers, rather than ambient OIDC discovery. See [Vercel authentication](https://vercel.com/docs/sandbox/concepts/authentication) and [Daytona configuration](https://www.daytona.io/docs/en/typescript-sdk/daytona/). Model billing and model login are separate from provider allocation; no model access is required here.

```sh
OUTPOST_CLOUD_LIVE=1 OUTPOST_CLOUD_PROVIDERS=vercel,daytona node test/cloud-live.ts > /tmp/outpost-cloud-compatibility.json
```

Set `OUTPOST_CLOUD_AGENTS=1` to additionally install the current `@openai/codex`, `@anthropic-ai/claude-code` and `@google/gemini-cli` npm packages inside each disposable sandbox. The report records only the numeric CLI versions. Their actual version/help commands check the adapters' start options and, for Claude Code and Codex, resume and fork options. Gemini currently checks start only. This requires outbound npm access and more runtime. These checks exercise CLI syntax; they do not establish authenticated model execution, conversation capture or end-to-end agent behavior. The report always marks authenticated model turns as skipped.

The runner writes JSON with schema version 1 and per-provider/per-check `pass`, `fail` or `skipped` statuses. It omits raw SDK errors, command output, paths, tokens and file contents. Exit code 0 means the executed provider checks passed; 1 means a contract or cleanup failed; 2 means every provider was skipped. Read individual provider statuses: a passed provider does not turn another provider's missing credentials into a live pass.

The report also records `startedAt`, the Node.js version and `source.commit`/`source.dirty` from the fixture checkout before allocation. Keep the output outside the checkout so creating it does not mark the source dirty. A dirty checkout cannot establish compatibility of the recorded commit alone; unavailable Git metadata is reported as `null`. These fields are local observations, not signed provenance. Archive the workflow URL and report together, and compare the recorded commit with the commit you intend to validate. A successful run on an older remote commit does not verify unpushed changes.

## Scheduled checks

The separate `.github/workflows/cloud-compatibility.yml` runs each Monday and supports manual dispatch. Normal CI remains credential-free. Both scheduled and manual jobs require the `main` branch. To enable it in the GitHub mirror:

1. Create the `cloud-compatibility` GitHub environment; configure its protection rules and provider secrets from the table.
2. Set the **repository** Actions variable `OUTPOST_CLOUD_LIVE` to `1`. Without it the jobs are skipped before allocation. Environment-only variables cannot enable the job-level gate.
3. Review the environment's approval policy for scheduled jobs, provider quotas and budget. Both providers run independently; a missing credential produces a skipped JSON report and nonzero job exit, never a successful live result.

The workflow uploads the sanitized JSON even after a failed fixture. Scheduled runs include current CLI checks; manual dispatch can disable them. SDK versions follow the repository lockfile. This workflow does not deploy or publish anything.

## Cleanup and troubleshooting

Each provider gets a four-minute overall deadline, bounded commands and a separate thirty-second cleanup window. Successful lease release is repeated to check idempotence; failures trigger cleanup in `finally`. A lease arriving after an allocation deadline is released when it arrives. Failure before a lease is returned is reported separately and does not claim confirmed cleanup, even when background release of a late lease is attempted. Deadlines bound the fixture’s wait; they do not guarantee cancellation of every underlying SDK request or provider cleanup operation.

Vercel receives a five-minute sandbox lifetime. Daytona receives a five-minute idle auto-stop interval and deletion on stop; an idle timeout is not an absolute lifetime. These safeguards complement cleanup, which cannot be guaranteed after a killed process, unavailable API or incomplete allocation response. Inspect the provider dashboard after `cleanup-unconfirmed`, allocation failure, workflow cancellation or job timeout, and remove any remaining fixture resources. The test does not retry allocation automatically.

For `contract-failed`, rerun the deterministic suite (`node --test test/functional/cloud-*.test.ts`) first, then check SDK/CLI versions and provider availability. The reports intentionally suppress remote error text; investigate details privately through the provider dashboard. A CLI help failure can signal upstream option changes even while infrastructure checks pass. The deterministic suite uses SDK doubles and isolated local processes; it is not evidence that live account resources or paid model calls worked.

For probes in a sandbox you already own, see [diagnostics](../doctor/).
