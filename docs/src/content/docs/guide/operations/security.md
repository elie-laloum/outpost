---
title: "Execution boundaries and secrets"
description: "Execution boundaries and secrets — Outpost"
sidebar:
  order: 3
---

Outpost runs coding agents that execute project commands. Select repositories, mounts and credentials appropriate for that task.

Docker/Podman expose the selected checkout, required Git metadata and explicit volumes. Containers use a chosen UID/GID, reduced capabilities, no-new-privileges and a private home. Extra devices, writable mounts and elevated hooks deliberately widen that boundary.

Shared Git metadata remains writable. A mounted sandbox is not a hostile-agent boundary protecting the host repository or its configuration. Outpost disables host Git hooks for its own Git commands, but repository tooling can execute other code. `localSandboxProvider()` has no filesystem isolation.

Remote providers upload history and selected files to your cloud account. Review that provider’s storage/network policies. Credentials explicitly sent to the environment are available to code running there.

Agent credentials are prepared only when a harness selects `authentication`. Outpost reads account files on the host (regular files of at most 1 MiB; links and directories are refused) and never reads a system keychain. In an isolated sandbox, one installer receives the files on stdin and writes them into the private home with `0700` directories and `0600` files, refusing path traversal; secrets never appear in command arguments. Credential variables reach every command of that agent in the sandbox, so code the agent runs can read them. A copied account login carries your subscription session: prefer a dedicated profile or a long-lived token when refresh-token rotation matters. The local provider writes no credential file and runs no login command. See [authentication](../../manual/authentication/).

## Handle sensitive artifacts

- Keep secrets in ignored environment files or secure process configuration, not source or remote URLs.
- Prefer the harness `authentication` option to mounting authentication files; mount only needed files, preferably read-only when supported.
- Treat logs, native transcripts, bundles and patches as potentially sensitive.
- Apply retention and backup rules to `.outpost/logs`, `.outpost/recovery` and native agent storage independently.

Prompt substitution cannot introduce new expansion fragments, but values inside an existing shell command retain shell semantics. Use trusted, quoted values there.

Explicit `close()` or `await using` is the reliable cleanup path. SIGINT/SIGTERM await registered cleanup; a forced process exit cannot guarantee asynchronous cloud disposal. Inspect cloud resources after an abrupt host shutdown.

Report reproducible security defects privately through the repository’s security reporting channel when enabled, or contact the maintainer via the hosting profile. Never include live credentials in a report. The root `SECURITY.md` is the repository policy.
