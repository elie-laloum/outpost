---
title: "Conversations — Overview"
description: "Capture an agent’s native conversation after each turn, then restore it in a sandbox to resume or fork it."
sidebar:
  label: Overview
  order: 0
---

## Which agents resume and fork

A cold continuation restores the captured conversation into a new sandbox; a warm one reuses the open sandbox that ran it. Each CLI preset takes its native store by default, replaceable through its `conversations` setting.

| Agent                              | Default store                  | Cold resume | Warm resume       | Fork                                        |
| ---------------------------------- | ------------------------------ | ----------- | ----------------- | ------------------------------------------- |
| Claude Code                        | `createClaudeConversations()`  | Yes         | Yes               | Yes, `--fork-session`                       |
| Codex                              | `createCodexConversations()`   | Yes         | Yes               | Yes, `codex exec fork`                      |
| Kimi Code                          | `createKimiConversations()`    | Yes         | Yes               | Yes, `kimi fork` before the turn            |
| GitHub Copilot CLI                 | `createCopilotConversations()` | Yes         | Yes               | Rejected with code `configuration`          |
| Built-in harness (`createHarness`) | `createHarnessConversations()` | Yes         | Yes               | Yes, new transcript seeded with the history |
| Antigravity                        | None; a store is rejected      | No          | Same sandbox only | Rejected with code `configuration`          |

:::note
A fork copies the conversation, not the worktree. Give it its own branch to keep its commits apart.
:::

## Choose a store

Every store implements `locate` (find a capture on the host), `capture` (copy it out of the sandbox after a turn) and `restore` (write it into the next sandbox, rewriting recorded `cwd` paths).

| Function                                      | Keeps                                            | Host copy                                                                                          | Use it for                              |
| --------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `createTranscriptConversations(layout)`       | One JSONL file per conversation                  | Set by the layout: Claude `~/.claude/projects/<key>/`, Codex `~/.codex/sessions/<yyyy>/<mm>/<dd>/` | A CLI that writes one transcript file   |
| `createSessionBundleConversations(profile)`   | A session directory packed into one JSON bundle  | `.outpost/conversations/<format>/<id>.json` in the repository                                      | A CLI that keeps a session directory    |
| `createHarnessConversations()`                | The built-in harness transcript                  | `.outpost/conversations/harness/<id>.jsonl` in the repository                                      | `createHarness()`; restore does nothing |
| `createTransportConversations(base, options)` | The base store’s captures, archived as snapshots | Materialized under `.outpost/recovery/conversations` on `locate`                                   | Resuming on another machine             |

The `conversationHome` option of `dispatch()` or `createSandbox()` replaces `~`, or the repository for bundles, as the root of host copies.

:::caution
Captures hold the full conversation, including file contents the agent read. Transport archives are neither encrypted nor authenticated.
:::

## Entry points

Guide: [Conversations](../../../guide/conversations/) · [Native conversation formats](../../../guide/conversation-formats/) · [Where data lives](../../../guide/storage/)

- [createClaudeConversations](../../createclaudeconversations/)
- [createCodexConversations](../../createcodexconversations/)
- [createKimiConversations](../../createkimiconversations/)
- [createCopilotConversations](../../createcopilotconversations/)
- [createTranscriptConversations](../../createtranscriptconversations/)
- [createSessionBundleConversations](../../createsessionbundleconversations/)
- [createHarnessConversations](../../createharnessconversations/)
- [createTransportConversations](../../createtransportconversations/)
- [conversations](../../conversations/)
- [ConversationStore](../../conversationstore/)
- [NativeConversationStore](../../nativeconversationstore/)
- [ConversationRecord](../../conversationrecord/)
