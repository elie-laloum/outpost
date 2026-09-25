---
title: "Configuration and paths"
description: "Locate every input and understand environment precedence."
---

| Input                               | Resolution                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `repository`                        | Explicit checkout; library default is the current working directory.               |
| Generated starter `.env`            | Next to `run.ts`, explicitly loaded and passed as provider variables.              |
| Library `.outpost/.env`             | Under the target repository; the repository-root `.env` is not read automatically. |
| Empty environment declaration       | Inherits that exact host process variable.                                         |
| Explicit provider/adapter variables | Override repository values; declaring the same name on both is rejected.           |
| Brief file                          | Relative to the caller’s working directory unless you supply an absolute path.     |
| Logs, worktrees and locks           | Under the target repository’s `.outpost`.                                          |

Start with [an executable setup](../../../guide/start/quickstart/). Detailed rules: [environment and authentication](../../behavior/agents/environment/), [repository paths](../../behavior/sandboxes/repositories/), [CLI options](../cli/).

The `OUTPOST_AGENT` and `OUTPOST_AUTH` values in documentation `runtime.mts` examples are settings of that teaching script. They are not built-in library environment variables.
