---
title: "Troubleshoot your setup"
description: "Check your tools and sandbox before investigating agent or model failures."
---

## Check prerequisites

Run `outpost doctor` to check the tools needed by your sandbox provider and agent. Add `--image` to test the image in a temporary container before sending your first request.

```sh
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev
```

Each line shows a status (`PASS`, `WARN`, `FAIL`, `SKIPPED`), a check name and a remedy when something is missing. Fix every `FAIL` before your first dispatch, and read each `WARN`.

| Flag                 | Default  | What it selects                                                         |
| -------------------- | -------- | ----------------------------------------------------------------------- |
| `--sandbox-provider` | `docker` | `docker`, `podman`, `local`, `vercel` or `daytona`.                     |
| `--agent`            | `codex`  | `claude`, `codex`, `antigravity`, `copilot` or `kimi`.                  |
| `--image`            | none     | A local image to test in a temporary container. Docker and Podman only. |
| `--json`             | off      | Prints the report as JSON instead of text.                              |

| Exit status | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `0`         | No check failed. Warnings and skipped checks still need review.          |
| `1`         | A check failed, or an option is invalid.                                 |
| `130`       | Interrupted by Ctrl+C (SIGINT). The running probe and its children stop. |
| `143`       | Stopped by SIGTERM, with the same cleanup.                               |

An interrupted run also removes its temporary container.

## What doctor checks

Each probe has a five-second deadline. Host checks always run; image checks run only with `--image`.

| Check                                   | What it verifies                                                            | If it fails                            |
| --------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| `host.node`, `host.git`                 | Node.js 24 or later, and Git on `PATH`.                                     | `FAIL`                                 |
| `provider.cli`, `provider.connection`   | Docker or Podman is installed and its engine answers.                       | `FAIL`                                 |
| `host.tar`                              | `tar` is available for container transfers.                                 | `FAIL`                                 |
| `agent.host`                            | The agent CLI on the host and its version against the version Outpost pins. | `WARN`: a sandbox may have its own CLI |
| `image.runtime`                         | The image starts with the network disabled and an empty workspace.          | `FAIL`                                 |
| `image.node`, `image.git`, `image.home` | Node.js and Git inside the image, and a writable home directory.            | `FAIL`                                 |
| `agent.sandbox`                         | The agent CLI inside the image. A version other than the pinned one warns.  | `FAIL` when missing                    |
| `agent.cli.*`                           | The CLI help declares the options Outpost passes to it.                     | `FAIL`                                 |
| `image.cleanup`                         | The temporary container was removed.                                        | `FAIL`, with the container name        |

The engine checks and `host.tar` apply to Docker and Podman. For Vercel and Daytona, `provider.cloud` is skipped: the SDK, credentials and allocation are not checked. The last check, `execution`, is always skipped and lists what doctor never tests.

## Read the JSON report

`--json` prints the same checks for a script or a CI job ([Run in CI](../ci-automation/)).

```sh
npx outpost doctor --image outpost:dev --json > doctor.json
jq -r '.checks[] | select(.status != "pass") | "\(.status) \(.id): \(.message)"' doctor.json
```

```json
{
  "sandboxProvider": "docker",
  "agent": "codex",
  "image": "outpost:dev",
  "scope": "host-and-image",
  "placement": "mounted",
  "interactiveTerminal": true,
  "checks": [
    {
      "id": "agent.sandbox",
      "status": "warn",
      "version": "0.155.0",
      "referenceVersion": "0.156.1",
      "message": "Differs from the version pinned by Outpost; compatibility is unverified."
    }
  ],
  "hasFailures": false
}
```

API reference: [SandboxDiagnosticReport](../../reference/sandboxdiagnosticreport/) and [DiagnosticCheck](../../reference/diagnosticcheck/).

## Diagnose an open sandbox

`sandbox.diagnose()` probes the sandbox your code already holds, with its real provider and mounts. It leaves the sandbox open.

```ts
import { reportValue } from "./reporter.ts";
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const report = await sandbox.diagnose({ agent: "codex", transfers: true });
for (const check of report.checks)
  reportValue(check.status, check.id, check.message);
// Example output: pass sandbox.node v24.15.0
```

API reference: [SandboxDiagnosticOptions](../../reference/sandboxdiagnosticoptions/).

Each probe stops after `deadlineMs` (5,000 ms by default, 60,000 at most). `report.capabilities` compares what the provider advertises with what was observed. The diagnosis is a sandbox operation: it fails while a dispatch or command is running on the same sandbox.

For a [custom sandbox provider](../custom-sandbox-providers/), `diagnoseSandbox(lease)` runs the same probes on a `SandboxLease`.

## Check an agent adapter offline

`diagnoseAgentProtocol()` replays synthetic events bundled with Outpost through an agent's adapter. It runs no CLI and no model.

```ts
import { reportValue } from "./reporter.ts";
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";

const report = diagnoseAgentProtocol("claude");
reportValue(report.referenceVersion, report.hasFailures);
// Example output: 2.1.280 false
```

<!-- check:run -->

It prints the Claude Code version Outpost pins, then `false` when every sample decodes as expected.

## Test model access

Doctor stops before sign-in and model access. After it passes, run a small task that edits nothing, such as the review script in [Your first task](../first-request/), and read its actual result.

## Understand a connection timeout

A CLI agent can keep retrying an unreachable endpoint until its deadline. The error keeps the code `timeout`. When the agent's last reported failure was a connection problem, Outpost adds a hint.

API reference: [OutpostError](../../reference/outposterror/).

The hint summarizes the agent's report without copying its URL or credentials. It does not prove that the endpoint is down. Other error codes are listed in [Errors](../error-handling/).

## Limits

- Doctor tests neither sign-in, credentials nor model access, and allocates no sandbox without `--image`.
- `--image` uses a local image and never pulls one. The image user's UID must match yours, and the image needs `sh`, `sleep`, `setsid`, `kill`, `tar` and `cp`.
- Without `--image`, the agent version inside a container or cloud sandbox is not checked: the host version says nothing about it.
- `diagnoseAgentProtocol()` checks the adapter against recorded events, not the CLI you installed.

API: [diagnoseSandbox](../../reference/diagnosesandbox/) · [Sandbox](../../reference/sandbox/) · [SandboxDiagnosticReport](../../reference/sandboxdiagnosticreport/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/) · [unavailableFault](../../reference/unavailablefault/)
