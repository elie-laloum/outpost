# Simplification performance probes

Run `node scripts/benchmark-simplifications.mjs` with Node.js 24 or later. The script starts three fresh processes per case and emits JSON. It does not use accounts, network services or agent CLIs. Settlement uses 1,000 small files in an ephemeral local workspace and removes its temporary files afterward.

## Local observation, 21 October 2026

Environment: v24.21.0 on linux. The machine was shared with other validation work. These are diagnostic observations, not a before/after speedup or an isolated benchmark.

| Case       | Median whole-process time (ms) | Median peak RSS (KiB) |
| ---------- | ------------------------------ | --------------------- |
| cli        | 1081.1                         | Not collected         |
| core       | 896.3                          | 130244                |
| recipes    | 1174.5                         | 158184                |
| schemas    | 197.2                          | 95064                 |
| validation | 205.9                          | 98164                 |
| settlement | 1614.1                         | 146484                |

Whole-process time includes Node startup and imports. For settlement it also includes allocation, file creation, command execution, settlement and cleanup; it is not a measurement of the synchronization pass alone. The JSON includes the operation time separately. CLI peak memory is not collected. Filesystem traversal counts are not instrumented.

The probes do not justify removing concurrency checks or introducing a persistent manifest cache. Keep fresh manifest validation at effect boundaries. Native-schema splitting or caching should follow isolated repeated measurements that separate imports, filesystem latency and settlement phases.
