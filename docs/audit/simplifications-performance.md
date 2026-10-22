# Simplification performance probes

Run `node scripts/benchmark-simplifications.mjs` with Node.js 24 or later. The script starts three fresh processes per case and emits JSON. It does not use accounts, network services or agent CLIs. Settlement uses 1,000 small files in an ephemeral local workspace and removes its temporary files afterward.

| Case         | Operation                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `cli`        | Imports the CLI command tree and prints its help.                                                 |
| `core`       | Imports `/core`.                                                                                  |
| `recipes`    | Imports `/recipes`.                                                                               |
| `schemas`    | Imports the generated native recipe schemas.                                                      |
| `parse`      | Parses and validates a one-task recipe without configuration.                                     |
| `validation` | Runs `recipe validate --file --config` through the CLI with an ephemeral local configuration.     |
| `settlement` | Runs one command on 1,000 files and counts `fs/promises` traversal calls from the command onward. |

The filesystem counts include named imports in loaded modules; synchronous `fs` calls and child processes are not counted.

## Lazy command handlers, 22 October 2026

The CLI now imports a command's handler only when that command runs. Same environment as below, `cli` case on the previous and new commit:

| Case             | Operation (ms) | Peak RSS (KiB) |
| ---------------- | -------------- | -------------- |
| cli, before      | 363.8          | 156472         |
| cli, after       | 127.4          | 104980         |
| validation, both | 503–532        | 182252–191436  |

`--help` and `--version` now load 139 source modules instead of 625; the agent catalog, which the help text names, accounts for most of them. `recipe validate` still imports the recipe handler, so its cost is unchanged.

## Local observation, 22 October 2026

Environment: v24.15.0 on linux (WSL2), with no other validation running. Medians of three fresh processes.

| Case       | Whole process (ms) | Operation (ms) | Peak RSS (KiB) |
| ---------- | ------------------ | -------------- | -------------- |
| cli        | 472.8              | 435.2          | 156968         |
| core       | 329.3              | 297.7          | 123440         |
| recipes    | 447.3              | 408.2          | 148684         |
| schemas    | 91.1               | 59.1           | 93980          |
| parse      | 125.6              | 96.6           | 97512          |
| validation | 671.1              | 634.9          | 183152         |
| settlement | 1090.6             | 1058.2         | 147252         |

Settlement made the same calls in all three runs: 3 `readdir` and 6,151 `lstat`, with no `opendir` or `stat`. One `readdir` belongs to the single workspace manifest traversal; the other two belong to cleanup of the ephemeral directory. Each file costs about six `lstat` calls:

| Calls per file | Source                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| 2              | Ancestor symlink checks, once in the traversal and once in `fileManifest()` |
| 3              | The file itself: before hashing, inside `fileManifest()` and after hashing  |
| 1              | Ephemeral workspace cleanup                                                 |

The command therefore computes one manifest, not several. The repeated calls are the before/after stability checks and path-safety checks that detect concurrent edits and symlink swaps. This measurement does not isolate their cost, and removing them would weaken that protection.

The CLI validation path includes importing the command tree, which the `cli` case measures at 435 ms and 153 MiB peak memory. Validation adds about 200 ms and 26 MiB beyond that, and importing the native schemas alone takes about 60 ms. CLI startup dominates the cost of validating a small recipe; splitting the schemas by family could save at most part of those 60 ms.

## Earlier observation, 21 October 2026

Environment: v24.21.0 on linux. The machine was shared with other validation work. These are diagnostic observations, not a before/after speedup or an isolated benchmark.

| Case       | Median whole-process time (ms) | Median peak RSS (KiB) |
| ---------- | ------------------------------ | --------------------- |
| cli        | 1081.1                         | Not collected         |
| core       | 896.3                          | 130244                |
| recipes    | 1174.5                         | 158184                |
| schemas    | 197.2                          | 95064                 |
| validation | 205.9                          | 98164                 |
| settlement | 1614.1                         | 146484                |

Whole-process time includes Node startup and imports. For settlement it also includes allocation, file creation, command execution, settlement and cleanup; it is not a measurement of the synchronization pass alone. That run did not yet collect CLI peak memory or filesystem counts, and its `validation` case parsed the recipe only (now `parse`).

The probes do not justify removing concurrency checks or introducing a persistent manifest cache. Keep fresh manifest validation at effect boundaries. Native-schema splitting or caching should follow isolated repeated measurements that separate imports, filesystem latency and settlement phases.
