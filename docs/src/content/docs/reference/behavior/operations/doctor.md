---
title: "Diagnose the host and images"
description: "Check host prerequisites and agent CLI versions on the host or in a container image."
sidebar:
  order: 3
---

`outpost doctor` inspects the host by default. Add `--image` to also inspect a local Docker/Podman image in a temporary sandbox. Neither mode installs tools or makes a model call. Host and image diagnostics are available since 3.0.0; Gemini checks are available since 4.0.0.

```sh
outpost doctor --provider docker --agent codex
outpost doctor --provider podman --agent claude --json
outpost doctor --provider docker --agent codex --image outpost:my-workflow
```

From a source checkout, use Node.js 24+:

```sh
node src/cli/main.ts doctor --provider docker --agent codex
```

## Select the environment

`--provider` accepts `docker` (default), `podman`, `local`, `vercel` or `daytona`. `--agent` accepts `codex` (default), `claude` or `gemini`. Options are explicit: the command does not read the workflow script or its environment files. It does not require a Git checkout.

Every report checks the running Node.js version, Git on PATH and the selected agent's host CLI. Docker/Podman also check the engine CLI, access through `info` and host tar availability. Each external command has a five-second deadline and bounded output.

The report describes the selected built-in provider's placement and interactive-terminal support. These are Outpost adapter contracts, not results from a running sandbox. Cloud SDK installation, credentials, account access and allocation remain unverified.

## Check an image

`--image NAME` is supported only with Docker/Podman. The image must already exist in the selected engine; doctor never downloads or builds it. Use the same image as your workflow, for example:

```sh
node src/cli/main.ts doctor --provider docker --agent codex --image outpost:my-workflow
```

The command starts a separate container with networking disabled, an empty temporary workspace and a private ephemeral home. It does not mount your repository or pass host credentials. It uses Outpost's normal container user and execution adapter, so image UID mismatches and missing runtime tools fail startup. Workflow-specific mounts, environment variables and user overrides are not reproduced.

Checks identify Node.js and Git inside the container, verify home accessibility, and compare the selected agent CLI against the pinned version. The image's agent is reported as `agent.sandbox`, separately from `agent.host`. No agent bootstrap, authentication or model call runs. A missing or failing image agent is a failed check; a version mismatch is a warning.

Each engine operation and probe has a five-second deadline. Cancellation and timeout trigger cleanup. The report includes `image.cleanup`; a cleanup failure reports the owned container name and retains the temporary workspace for inspection. The command returns a failure if cleanup cannot be confirmed.

## Check the agent CLI commands

After a successful image agent-version probe, doctor also runs the default headless adapter requests for a new turn, resume and fork with `--help`. The checks are `agent.cli.start`, `agent.cli.resume` and `agent.cli.fork`. They run inside the same temporary image sandbox with empty input and a placeholder conversation identifier. They never resume or fork a real conversation.

A successful exit alone is insufficient: some CLIs display help even for unknown options. Doctor also checks the expected command's usage line and the declarations of the long options used by Outpost. Missing declarations or failed commands produce `FAIL`. Unrecognized help produces `WARN`, leaving support unverified. If the version probe fails, the help checks are `SKIPPED`.

These checks confirm only the commands and option names advertised in help for the default headless settings. They do not validate option values, custom settings, interactive sessions, protocol events or successful conversation execution. A version mismatch remains a warning even when all help checks pass. Help output is bounded separately for each stream and is not copied into the report.

## Interpret the report

| Status    | Meaning                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PASS`    | This specific check succeeded.                                                                                         |
| `WARN`    | The host agent CLI is missing/unidentified, an agent version differs from the pinned version, or help is unrecognized. |
| `FAIL`    | A prerequisite, image, CLI help or cleanup check failed; follow its suggested action.                                  |
| `SKIPPED` | The capability was not checked.                                                                                        |

An exact agent-version match only confirms the version pinned in Outpost's image recipe and bootstrap configuration. It does not prove protocol compatibility or authentication. A different version is unverified, not necessarily incompatible. A missing host agent is a warning: dispatch can bootstrap a missing CLI, and isolated providers have their own agent installation.

The host agent version does not describe an existing container or cloud sandbox. `--image` checks a fresh sandbox only. Workflow mounts, repository state, credentials and model access require separate checks in the actual execution environment. A successful doctor run is not a guarantee that dispatch will succeed.

Exit code `1` means a failed check or invalid invocation. Warnings and skipped checks alone leave exit code `0`. `--json` writes only the report to stdout for a valid invocation, including when checks fail. Its fields include `provider`, `agent`, `scope` (`host` or `host-and-image`), optional `image`, `placement`, `interactiveTerminal`, `checks` and `hasFailures`. Check records contain `id`, `status`, `message` and optional `version`/`referenceVersion`. Raw command output and credentials are not included.

See [troubleshooting](../../../../guide/operations/troubleshooting/) for execution failures and [recovery](../../../../guide/operations/recovery/) for retained work.

## Inspect a sandbox you already own

Call `sandbox.diagnose()` or `diagnoseSandbox(sandbox)` in the workflow that owns the running sandbox. This inspects its actual Node.js/Git binaries, home permissions, command output streams and nonzero exit status. It never allocates, releases, bootstraps or replaces the sandbox. All probes hold the sandbox's exclusive operation gate; another dispatch, attachment or command cannot overlap them.

```ts
import { createSandbox, diagnoseSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const sandbox = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({ image: "outpost:my-workflow" }),
});
try {
  const report = await diagnoseSandbox(sandbox, {
    agent: "codex",
    deadlineMs: 5000,
  });
  console.log(report.hasFailures, report.capabilities, report.checks);
} finally {
  await sandbox.close();
}
```

`agent` is optional. When present, it adds version and default start/resume/fork help checks against the installed sandbox CLI. It never runs a conversation. Without `agent`, no agent executable is invoked. Existing environment variables remain those of the owned sandbox; this does not reproduce the network-disabled, credential-free `--image` environment.

Commands retain bounded output and have a deadline of five seconds each by default, configurable from 1 to 60,000 milliseconds with `deadlineMs`. An optional `signal` cancels further probes. Providers must honor command and transfer cancellation/deadlines; diagnostics cannot force a custom provider that ignores its contract to settle. Reports contain sanitized observations, not raw output or provider errors. `scope` is `owned-sandbox`, `ownership` is `caller`, and `modelCompatibility` remains `unverified`.

### Explicit cloud and transfer probes

`diagnoseSandbox(lease, options)` accepts an existing `SandboxLease`, including a cloud lease explicitly acquired by your code. No cloud allocation is triggered by doctor; your workflow chooses the provider, credentials, resource cost and cleanup. You must hold exclusive ownership of a directly supplied lease during inspection and release it yourself. You can provide `{ provider: { name, placement } }` as advertised metadata; diagnostics do not verify that metadata. A `Sandbox` supplies its actual configured provider automatically.

Opt into `transfers: true` to test binary upload and download. This writes a unique temporary directory under the lease root, verifies the uploaded bytes through a Node.js process inside the sandbox, and compares the download on the host. Cleanup runs with a separate bounded signal even after cancellation. Check `sandbox.transfers.cleanup`; a failure includes the retained probe path and leaves ownership with the caller. Successful probes remove their temporary host and sandbox files. The default does not create transfer files.

`capabilities` separates `advertised` method availability from `observed` results. A passing transfer probe covers the small binary file only. Batch transfer methods, symlinks, permissions, directory semantics and interactive terminals remain unverified. Cancellation of arbitrary workload descendants, network access, repository synchronization and account/model access are not certified by these checks. For explicit cloud SDK compatibility tests, see [cloud compatibility](../../../../guide/extend/cloud-compatibility/).

## Inspect bundled protocol fixtures

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";

console.log(diagnoseAgentProtocol("codex"));
console.log(diagnoseAgentProtocol("claude"));
```

This synchronous, offline report decodes bundled synthetic events for conversation identifiers, text, tools, usage, completion, failures, unknown events and malformed input. `scope` is `bundled-protocol-fixtures`. `referenceVersion` identifies the configured agent version; both `installedCli` and `modelCompatibility` remain `unverified`. A passing result verifies the package's parser against those structural fixtures, not any installed executable, authenticated account or model. No real model probe is provided or called implicitly.

The deterministic executable fixtures in `test/fixtures/agent-protocol.ts` additionally exercise the default start/resume/fork request arguments and stdin with chunked JSON-line output. Run them from a source checkout with `node --test test/functional/doctor-protocol.test.ts`. They do not use installed agent CLIs or credentials.

Run `node test/fixtures/sandbox-diagnostics.ts` from a source checkout for a complete local demonstration. It creates a temporary Git repository, diagnoses an explicit `local()` sandbox with binary transfer probes, verifies subsequent command reuse, checks both bundled protocols and removes its temporary resources. It never invokes a real agent. To exercise an existing local container image instead, set `OUTPOST_CONTAINER_ENGINE=docker` or `podman`; `OUTPOST_CONTAINER_IMAGE` defaults to `outpost-ci:latest`. The fixture retains its temporary repository if sandbox cleanup cannot be confirmed.
