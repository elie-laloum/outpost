---
title: "Commands and terminal — Overview"
description: "Run a program in a sandbox and read its exit status, or open an agent’s interactive terminal there."
sidebar:
  label: Overview
  order: 0
---

## Choose a call

| Call                       | Sandbox                                   | Returns                                            | Use it for                                  |
| -------------------------- | ----------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `sandbox.command(command)` | Your open sandbox, left open              | `status`, `stdout`, `stderr`                       | Tests, builds and checks between agent runs |
| `sandbox.attach(options)`  | Your open sandbox, left open              | `status`, `commits`, `branch`                      | Working by hand in the agent’s own CLI      |
| `attach(options)`          | Allocated for the call, closed afterwards | `status`, `commits`, `branch`, `retainedDirectory` | One interactive session on a new sandbox    |

No shell parses `arguments`: run `sh -c` yourself for pipes or globs. A sandbox runs one operation at a time; a second call made meanwhile rejects with code `configuration`.

:::note
`attach` and `interactive: true` need a terminal: Docker, Podman, the host and Daytona support them, Vercel and Firecracker reject them.
:::

## How a command ends

| Event                            | Default                                               | Outcome                                                                                     |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Process exits, with any status   | —                                                     | Resolves once the process exits; check `status`                                             |
| Output streams close before exit | —                                                     | Keeps waiting for the process                                                               |
| `deadlineMs` elapses             | 600000 (10 minutes); 86400000 (24 hours) for `attach` | Stops the process group; rejects with code `timeout` (`TimeoutError` on Vercel and Daytona) |
| `signal` aborted                 | —                                                     | Stops the process group; rejects with the signal’s reason                                   |
| `observe` throws                 | —                                                     | Stops the process group; rejects with that exception                                        |
| Output longer than `retain`      | 65536 characters per stream                           | The result keeps the tail; `observe` receives every chunk                                   |

The sandbox stays open after a deadline or a cancellation. `attach()` applies the branch policy when the session exits with status 0 and keeps the worktree otherwise.

## Entry points

Guide: [Sandbox sessions](../../../guide/sandbox-sessions/) · [Limits and cancellation](../../../guide/limits-and-cancellation/) · [Write a brief](../../../guide/briefs/)

- [attach](../../attach/)
- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [Channel](../../channel/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [VariableQuestion](../../variablequestion/)
- [RequiredAgent](../../support-requiredagent/)
