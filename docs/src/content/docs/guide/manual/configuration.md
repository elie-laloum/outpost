---
title: "Configuration and paths"
description: "Locate every input and understand environment precedence."
---

| Input                               | Resolution                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`                        | Explicit checkout; library default is the current working directory.                                                                                                                                                            |
| Generated starter `.env`            | Next to `run.ts`, explicitly loaded and passed as provider variables.                                                                                                                                                           |
| Library `.outpost/.env`             | Under the target repository; the repository-root `.env` is not read automatically.                                                                                                                                              |
| Empty environment declaration       | Inherits that exact host process variable.                                                                                                                                                                                      |
| Explicit provider/adapter variables | Override repository values; declaring the same name on both is rejected.                                                                                                                                                        |
| Credential variables                | `variable` and `usage` forms read the resolved variables above, never an undeclared host variable.                                                                                                                              |
| Account files                       | Read on the host from the CLI's default location, its override variable (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`, `COPILOT_HOME`, `KIMI_CODE_HOME`) or `account.file`; a relative `account.file` resolves from the process directory. |
| Brief file                          | Relative to the caller’s working directory unless you supply an absolute path.                                                                                                                                                  |
| Logs, worktrees and locks           | Under the target repository’s `.outpost`.                                                                                                                                                                                       |

Start with [an executable setup](../../start/quickstart/). Detailed rules: [authentication](../authentication/), [environment](../../behavior/agents/environment/), [repository paths](../../behavior/sandboxes/repositories/), [CLI options](../cli/).

The `OUTPOST_AGENT`, `OUTPOST_AUTH` and `OUTPOST_MODEL` values in documentation `runtime.mts` examples are settings of that teaching script. They are not built-in library environment variables.
