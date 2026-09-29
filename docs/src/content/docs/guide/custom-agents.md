---
title: "Add a CLI agent"
description: "Connect a coding-agent CLI that Outpost does not support yet."
---

A `CliHarness` exposes `kind: "cli"` and `bind(model)`, returning an `AgentAdapter`. Compose it with `createAgent({ harness })`. Keep request construction and event decoding separate, declare continuation capabilities honestly and supply a conversation store only if restoration works.

Only `name`, `request()` and `events()` are required. Each optional member enables one capability: `resumable`, `forkable` and `fork()` for continuation, `storage` for portable conversations, `credentials()` and `configuration()` for the agent home, `quota()` and `unavailable()` for [fallback](../fallback-agents/) and quota pauses, `usage` for token accounting and `liveInput` for [steering](../steering/) a running turn. Outpost supervises the process, sandbox, cancellation and retries the same way for every adapter.
