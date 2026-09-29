---
title: "Add a sandbox provider"
description: "Implement a sandbox provider for another execution environment."
---

Return a lease with `root`, `home`, invocation, upload/download and idempotent release. Preserve exit status after output streams close, process cancellation and binary transfer semantics. `createMountedSandboxProvider()` and `createRemoteSandboxProvider()` help compose the corresponding strategies.

## Provider transfers

When implementing a provider, `SandboxLease.upload()` and `download()` transfer files and directory contents with cancellation and deadlines. Preserve binary bytes, supported modes and symlinks. Container transfers must see tmpfs and other live mounts.

Optional `fileTransfers` capabilities support manifests and bounded batches for incremental synchronization. An adapter must explicitly provide them; the application does not infer support from a provider name.

API: [SandboxLease](../../reference/sandboxlease/) · [FileTransfers](../../reference/filetransfers/).
