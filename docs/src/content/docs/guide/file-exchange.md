---
title: "File exchange"
description: "Move repository state without losing host changes."
---

Mounted providers see the selected workspace through the live host mount. Remote providers upload a snapshot and synchronize changes back. Your application uses the same sandbox operations, but the file ownership differs.

## Remote inputs

`copies` selects additional repository-relative files. `includeUncommitted` includes host edits in the remote snapshot. Send only the inputs required for the task; remote allocation uploads them to your cloud account.

## Synchronization

Before applying incoming changes, Outpost validates the transfer and backs up the host state. If the host changed concurrently, synchronization fails instead of silently overwriting it. Preserve the reported transfer directory and use [Failure recovery](../failure-recovery/) to inspect both sides.

## Provider transfers

When implementing a provider, `SandboxLease.upload()` and `download()` transfer files and directory contents with cancellation and deadlines. Preserve binary bytes, supported modes and symlinks. Container transfers must see tmpfs and other live mounts.

Optional `fileTransfers` capabilities support manifests and bounded batches for incremental synchronization. An adapter must explicitly provide them; the application does not infer support from a provider name.

API: [SandboxLease](../../reference/sandboxlease/) · [FileTransfers](../../reference/filetransfers/).
