---
title: "Diagnostics — Overview"
description: "Check a host, an image, an open sandbox or an agent adapter before paying for a model call."
sidebar:
  label: Overview
  order: 0
---

## Choose a diagnostic

| Tool                                                      | What it probes                                                                                            | What it runs                                             | Result                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `outpost doctor`                                          | The host: Node.js 24+, Git, the container engine, `tar`, the agent CLI. With `--image`, the image as well | Host commands, plus a temporary container for `--image`  | Text or `--json`; exit status `1` when a check fails |
| `sandbox.diagnose(options)` or `diagnoseSandbox(sandbox)` | Your open sandbox, with its real provider and mounts                                                      | Probe commands in the sandbox, as an exclusive operation | `SandboxDiagnosticReport`; the sandbox stays open    |
| `diagnoseSandbox(lease, options)`                         | A `SandboxLease` from a custom provider                                                                   | The same probes on the lease                             | `SandboxDiagnosticReport`; you release the lease     |
| `diagnoseAgentProtocol(agent)`                            | The adapter’s event decoding                                                                              | No process: bundled fixtures, synchronously              | `AgentProtocolReport`, one check per fixture         |

With `--image`, doctor runs the same agent version and CLI help probes as `diagnoseSandbox` with `agent`, with a fixed 5000 ms deadline per probe.

## What diagnoseSandbox checks

Each probe stops after `deadlineMs`, 5000 by default and 60000 at most. A failed probe becomes a `fail` check and the call still resolves; `hasFailures` is `true` when any check is `fail`.

| Check                                            | Runs when                                           | What it runs                                                                          | `pass` means                                                      | Otherwise                                                                          |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `sandbox.node`, `sandbox.git`                    | Always                                              | `node --version`, `git --version`                                                     | A version was read                                                | `fail`                                                                             |
| `sandbox.command`                                | Always                                              | A Node.js script writing to stdout and stderr, then exiting with status 7             | Both streams and the status came back intact                      | `fail`                                                                             |
| `sandbox.home`                                   | Always                                              | A Node.js check of the lease home                                                     | The home is a readable, writable directory                        | `fail`                                                                             |
| `agent.sandbox`                                  | `agent` is set                                      | The agent CLI with `--version`                                                        | The version equals the one Outpost pins                           | `warn` for another version; `fail` when missing or unreadable                      |
| `agent.cli.<mode>`                               | `agent` is set and `agent.sandbox` passed or warned | CLI help for `start`, `resume` and, for Claude Code, Codex and Kimi, `fork`           | The help shows the expected usage and every option Outpost passes | `warn` when the usage is not found; `fail` when help fails or an option is missing |
| `sandbox.transfers`, `sandbox.transfers.cleanup` | `transfers: true`                                   | Upload a binary file under the root, verify it in the sandbox, download it, delete it | The bytes match and the probe directory was removed               | `fail`                                                                             |
| `model`                                          | Always                                              | Nothing                                                                               | —                                                                 | Always `skipped`                                                                   |

`capabilities` reports `command` and `transfers` from these checks; `batchTransfers` and `interactiveTerminal` are never probed.

:::note
A report without failures proves neither sign-in nor model access. Run a small task to check them.
:::

## Entry points

Guide: [Diagnostics](../../../guide/diagnostics/) · [CLI commands](../../../guide/cli/) · [Add a sandbox provider](../../../guide/custom-sandbox-providers/)

- [diagnoseSandbox](../../diagnosesandbox/)
- [diagnoseAgentProtocol](../../diagnoseagentprotocol/)
- [SandboxDiagnosticOptions](../../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)
- [DiagnosticCheck](../../diagnosticcheck/)
- [DiagnosticStatus](../../diagnosticstatus/)
- [DiagnosticCapability](../../diagnosticcapability/)
- [AgentProtocolReport](../../agentprotocolreport/)
- [DoctorAgent](../../doctoragent/)
