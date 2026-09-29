---
title: "Errors — Overview"
description: "Read an OutpostError: its fault code, structured details, recovery record, and whether it reports a quota or an outage."
sidebar:
  label: Overview
  order: 0
---

## Fault codes

Every `OutpostError` carries one `code`; branch on it, not on `message`. `details` holds the context of that code.

| Code            | Raised when                                                                                                                                | Retry                                           | Typical `details`                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| `configuration` | Options fail validation, a sandbox is closed or busy, an account credential file is missing or malformed, a storage reservation is refused | No: fix the call                                | `path`, `overlap`                                                    |
| `process`       | An agent exits nonzero or without a final event, a command task exits nonzero                                                              | When `unavailableFault()` matches               | `status`, `stdout`, `stderr`, `conversation`, `agent`, `unavailable` |
| `timeout`       | `idleMs`, `deadlineMs`, a command, tool, transfer, MCP startup, model request or workflow `timeoutMs` elapses                              | After raising the limit; effects may be partial | `deadlineMs`, `timeoutMs`, `stopReason`, `unavailable`               |
| `aborted`       | The sandbox closes during an operation, a harness turn or tool call ends, a model request is cancelled                                     | In an open sandbox                              | —                                                                    |
| `workspace`     | Unsafe path or symlink, recovery quota admission refused, remote synchronization or recovery restore fails                                 | After inspecting retained files                 | `path`, `directory`, `recovery`                                      |
| `conflict`      | Worktree locked, branch checked out elsewhere, host edits during synchronization, automatic integration fails                              | After resolving on the host                     | `directory`, `branch`, `files`, `recovery`, `lock`                   |
| `prompt`        | A prompt variable is missing or a prompt command fails                                                                                     | No: fix the brief                               | `key`, `command`, `status`, `stderr`                                 |
| `response`      | A typed response is missing or invalid (`ResponseError`), a model or MCP reply is invalid                                                  | Typed responses get repair turns first          | `tag`, `raw`, `server`, `rpcCode`                                    |
| `session`       | A conversation or transcript to resume is missing or unreadable                                                                            | No                                              | `id`, `repository`                                                   |
| `provider`      | A sandbox provider operation fails, a model returns a non-429 HTTP error or a stream error                                                 | When `unavailableFault()` matches               | `status`, `retryAfterMs`, `type`, `unavailable`                      |
| `limit`         | A built-in harness reaches `maxSteps`, `maxToolCalls`, `maxOutputTokens`, its token budget or delegation depth                             | No: raise the limit                             | `limit`, `step`                                                      |
| `quota`         | An agent CLI or model provider reports a terminal usage or rate limit                                                                      | After `resetAt`                                 | `resetAt`, `retryAfterMs`, `status`, `agent`, `fallback`             |
| `replay`        | A replay agent diverges from its journal (`ReplayDivergence`)                                                                              | No: record again                                | `kind`, `turn`, `expected`, `actual`                                 |
| `steering`      | A steering instruction is not delivered before the dispatch ends or the controller closes                                                  | On the next dispatch                            | `text`, `subagent`                                                   |

`recoveryDetails(error)` returns where the work survived, such as `branch`, `directory`, `commits`, `transcript`, `logReference` or `conversation`. A remote synchronization failure names its transfer directory in `details.recovery` instead.

:::caution
Gates, checkpoints, artifacts, transports, queues and schedules throw `Error` or its subclasses without `code`, and a call whose `signal` you abort rejects with the abort reason. Test `instanceof OutpostError` before reading `code`.
:::

## Quotas and outages

`quotaFault()` and `unavailableFault()` search the error and up to seven wrapped causes. An outage keeps its original code, so recognize it with `unavailableFault()`.

| Signal                                                                       | `code`     | `quotaFault()`                                | `unavailableFault().message` |
| ---------------------------------------------------------------------------- | ---------- | --------------------------------------------- | ---------------------------- |
| Agent CLI reports a terminal usage limit                                     | `quota`    | Match; `resetAt` when reported                | —                            |
| Model HTTP 429                                                               | `quota`    | Match; `resetAt` from `Retry-After`           | —                            |
| Model stream `rate_limit_error`, `rate_limit_exceeded`, `insufficient_quota` | `quota`    | Match                                         | —                            |
| Every candidate of a fallback agent hits a quota                             | `quota`    | Match; earliest `resetAt` when all report one | —                            |
| Agent failure text its adapter recognizes as an outage                       | `process`  | —                                             | The matched text             |
| Model HTTP 408, 500, 502, 503, 504 or 529                                    | `provider` | —                                             | `HTTP <status>`              |
| Model stream `overloaded_error`, `api_error`, `server_error`                 | `provider` | —                                             | The error type               |
| Model connection or redirect failure                                         | `provider` | —                                             | `HTTP transport failure`     |
| Timeout after an agent reported a connection failure                         | `timeout`  | —                                             | `connection failure`         |

That last timeout also gets `details.agentDiagnostic: "connection"`, so a fallback agent covering `unavailable` moves to its next candidate. A task `retry` waits at least `details.retryAfterMs`, parsed from an HTTP `Retry-After` header.

## Entry points

Guide: [Errors](../../../guide/error-handling/) · [Recover work](../../../guide/recovery/) · [Quota pauses](../../../guide/quota-pauses/)

- [quotaFault](../../quotafault/)
- [unavailableFault](../../unavailablefault/)
- [recoveryDetails](../../recoverydetails/)
- [OutpostError](../../outposterror/)
- [FaultCode](../../faultcode/)
- [QuotaFault](../../type-quotafault/)
- [UnavailableFault](../../type-unavailablefault/)
