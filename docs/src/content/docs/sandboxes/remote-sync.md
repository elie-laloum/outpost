---
title: "Remote synchronization"
description: "Remote synchronization — Outpost"
sidebar:
  order: 6
---

Remote providers work on another filesystem. Outpost transfers Git history and selected inputs, then synchronizes changes back after operations.

## Initial state

Remote workspaces require `named` or `integrate`; the default is `integrate`. By default, only committed history is sent. Set `includeUncommitted: true` on sandbox creation or dispatch to seed host patches and untracked files too. Explicit `copies` are transferred as selected inputs.

The remote environment needs Git and the provider’s command prerequisites. Outpost can bootstrap a missing selected agent (`bootstrap: true`, the default). Use `bootstrap: false` when supplying a prepared image.

A fresh destination receives a complete Git bundle. If a preseeded destination has a verified ancestor of the requested commit and its reachable objects, Outpost sends only the missing history; an identical verified HEAD needs no history upload. Missing or unrelated bases use a complete bundle.

## Returning changes

Dispatches and commands synchronize the remote workspace back. New commits keep their object IDs, authors, timestamps and parent relationships. Repeated synchronization handles uncommitted work that later becomes committed without duplicating it.

Later pulls send a delta bundle when both sides have the last synchronized commit and the remote history advances from it. Outpost imports the delta into an independent local repository, verifies it, and rebuilds a complete `commits.bundle` for recovery. This saves network traffic; local validation still requires disk space and processing for the complete reachable history. Interrupted downloads can leave partial artifacts.

Outpost compares the host state with the previous synchronized state before applying incoming changes. Overlapping host edits, unexpected concurrent edits and rewritten remote history cause an error instead of silent replacement. Avoid editing a workspace locally while its remote sandbox is active.

Git and patch validation runs in an independent repository without changing the host index, `FETCH_HEAD` or worktree registrations. Host import starts only after validation and backups succeed.

Incoming history, patches and untracked files are backed up under `.outpost/recovery` before application. Failed transfers preserve available recovery material; an interrupted transfer may not contain every remote file. Review [recovery procedures](../../operations/recovery/) before applying a bundle or patch manually.

## Transfer limits

`limits.copyMs` overrides transfer timeouts used by orchestration; otherwise transfers default to 120 seconds. Custom leases receive optional `{ signal, deadlineMs }` as the third argument to `upload` and `download`. Both files and directories are supported by the built-in providers.

Remote cloud providers do not expose native interactive attachment in this release. Use noninteractive dispatch and commands.
